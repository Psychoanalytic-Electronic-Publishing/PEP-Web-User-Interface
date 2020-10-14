import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { scheduleOnce, next } from '@ember/runloop';
import { inject as service } from '@ember/service';

import AuthService from 'pep/services/auth';
import PepSessionService from 'pep/services/pep-session';
import ScrollableService from 'pep/services/scrollable';
import LoadingBarService from 'pep/services/loading-bar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import { DOCUMENT_EPUB_BASE_URL, DOCUMENT_PDFORIG_BASE_URL, DOCUMENT_PDF_BASE_URL } from 'pep/constants/documents';
import { serializeQueryParams } from 'pep/utils/url';
import ENV from 'pep/config/environment';

export type SearchPreviewMode = 'minimized' | 'maximized' | 'fit' | 'custom';

interface SearchPreviewArgs {
    mode: SearchPreviewMode;
    maxHeight?: number;
    result?: Document;
    setMode: (mode: SearchPreviewMode) => void;
    close: () => void;
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service scrollable!: ScrollableService;
    @service loadingBar!: LoadingBarService;

    @tracked fitHeight: number = 0;
    @tracked isDragResizing: boolean = false;

    innerElement: HTMLElement | null = null;
    scrollableElement: HTMLElement | null = null;
    minFitHeight: number = 40;
    startingDragHeight: number = 0;

    get mode() {
        return this.args.mode || 'fit';
    }

    get isFitMode() {
        return this.mode === 'fit';
    }

    get isCustomMode() {
        return this.mode === 'custom';
    }

    get isMinimizedMode() {
        return this.mode === 'minimized';
    }

    get styles() {
        return (this.isFitMode || this.isCustomMode) && this.adjustedFitHeight && this.args.result
            ? htmlSafe(`height: ${this.adjustedFitHeight}px;`)
            : null;
    }

    get adjustedFitHeight() {
        return Math.min(this.fitHeight, this.args.maxHeight || this.fitHeight);
    }

    get downloadAuthParams() {
        return serializeQueryParams({
            'client-id': ENV.clientId,
            'client-session': this.session.data.authenticated.SessionId
        });
    }

    get downloadUrlEpub() {
        return `${DOCUMENT_EPUB_BASE_URL}/${this.args.result?.id}/?${this.downloadAuthParams}`;
    }

    get downloadUrlPdf() {
        return `${DOCUMENT_PDF_BASE_URL}/${this.args.result?.id}/?${this.downloadAuthParams}`;
    }

    get downloadUrlPdfOrig() {
        return `${DOCUMENT_PDFORIG_BASE_URL}/${this.args.result?.id}/?${this.downloadAuthParams}`;
    }

    /**
     * Sets up an auth succeeded event listener to reload open search result documents
     * @param {unknown} owner
     * @param {SearchFormArgs} args
     */
    constructor(owner: unknown, args: SearchPreviewArgs) {
        super(owner, args);
        this.session.on('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * Removes the auth succeeded event listener on component destroy
     */
    willDestroy() {
        super.willDestroy();
        this.session.off('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * If a result preview is open when the user logs in, reload it to make sure
     * its displaying the correct content based on their current session/subscription/etc
     */
    @action
    onAuthenticationSucceeded() {
        this.args.result?.reload();
    }

    /**
     * Calculates the height that will allow all the content to show w/o scrolling
     * constrained to a maximum height that is the parent container's height
     */
    @dontRunInFastboot
    updateFitHeight() {
        this.fitHeight = this.innerElement?.offsetHeight ?? 0;
    }

    /**
     * Saves a reference to the <Scrollable>'s element
     * @param {HTMLElement} element
     */
    @action
    onScrollableInsert(element: HTMLElement) {
        this.scrollableElement = element;
    }

    /**
     * Calculate the content's "fit" height on render
     * @param {HTMLElement} element
     */
    @action
    async onElementInsert(element: HTMLElement) {
        this.innerElement = element;
        scheduleOnce('afterRender', this, this.updateFitHeight);

        try {
            this.loadingBar.show();
            await this.args.result?.reload();
        } finally {
            this.loadingBar.hide();
            scheduleOnce('afterRender', this, this.updateFitHeight);
        }
    }

    /**
     * Reloads the previewed result on open/change, to ensure its displaying the
     * correct content based on their current session/subscription/etc, and then
     * recalculate the content's "fit" height
     */
    @action
    async onResultUpdate() {
        if (this.isFitMode) {
            scheduleOnce('afterRender', this, this.updateFitHeight);
        }

        try {
            this.loadingBar.show();
            await this.args.result?.reload();
        } finally {
            this.loadingBar.hide();
            if (this.isFitMode) {
                scheduleOnce('afterRender', this, this.updateFitHeight);
            }
        }
    }

    /**
     * Sets the preview pane's sizing mode
     * @param {SearchPreviewMode} mode
     */
    @action
    setMode(mode: SearchPreviewMode) {
        // reset the calculated fit size in case it was resized
        if (mode === 'fit') {
            this.updateFitHeight();
        }

        this.args.setMode(mode);
    }

    /**
     * Closes the preview pane
     */
    @action
    close() {
        this.args.close();
        this.fitHeight = 0;
    }

    /**
     * Show the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true);
    }

    /**
     * Initiates a document download for the given URL
     *
     * NOTE: Opens the download in a new tab/window so that in case it fails
     * (i.e. the doc does not exist), the app itself is not navigated to an API error page
     *
     * @TODO make sure opening a new window doesn't fail due to security settings (popup blockers/etc)
     * in which case we may need to revert to starting the download in the same window, but get better
     * indicators from the API on the document model when documents do or do not exist to download.
     *
     * @param {string} url
     * @returns {Window | null}
     */
    @action
    downloadDocument(url: string) {
        return window.open(url, '_blank');
    }

    /**
     * When drag resizing starts, set the pane to not animate height changes
     */
    @action
    onDragStart() {
        if (!this.isCustomMode && this.scrollableElement) {
            this.fitHeight = this.scrollableElement.offsetHeight;
            this.args.setMode('custom');
        }

        this.startingDragHeight = this.fitHeight;
        this.isDragResizing = true;
    }

    /**
     * While drag resizing, resizes the pane to match the current size
     */
    @action
    onDragMove(position: number) {
        this.fitHeight = Math.max(this.minFitHeight, this.startingDragHeight - position);
    }

    /**
     * When drag resizing ends, update the pane with the new height
     * @param {number} position
     */
    @action
    onDragEnd(position: number) {
        if (!this.isCustomMode) {
            this.args.setMode('custom');
        }

        this.fitHeight = Math.max(this.minFitHeight, this.startingDragHeight - position);
        this.startingDragHeight = 0;
        next(this, () => (this.isDragResizing = false));
    }
}
