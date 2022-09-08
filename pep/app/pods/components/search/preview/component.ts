import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { DS } from 'ember-data';

import ModalService from '@gavant/ember-modals/services/modal';

import { IJP_OPEN_CODE } from 'pep/constants/books';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Abstract from 'pep/pods/abstract/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import AuthService from 'pep/services/auth';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import PreviewPaneService, { SearchPreviewMode, SearchPreviewModeId } from 'pep/services/preview-pane';
import ScrollableService from 'pep/services/scrollable';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface SearchPreviewArgs {
    maxHeight?: number;
    resultId?: string;
    height?: number;
    close: () => void;
    loadDocument?: (abstract: Abstract) => void;
}

export default class SearchPreview extends Component<BaseGlimmerSignature<SearchPreviewArgs>> {
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service router!: RouterService;
    @service scrollable!: ScrollableService;
    @service loadingBar!: LoadingBarService;
    @service store!: DS.Store;
    @service modal!: ModalService;
    @service previewPane!: PreviewPaneService;
    @tracked fitHeight: number = this.previewPane.mode.options?.height ?? 0;
    @tracked isDragResizing: boolean = false;
    @tracked result?: Abstract;

    innerElement: HTMLElement | null = null;
    scrollableElement: HTMLElement | null = null;
    minFitHeight: number = 40;
    startingDragHeight: number = 0;

    get mode() {
        return this.previewPane.mode;
    }

    get isFitMode() {
        return this.mode.id === SearchPreviewModeId.FIT;
    }

    get isCustomMode() {
        return this.mode.id === SearchPreviewModeId.CUSTOM;
    }

    get isMinimizedMode() {
        return this.mode.id === SearchPreviewModeId.MINIMIZED;
    }

    get styles() {
        return (this.isFitMode || this.isCustomMode) && this.adjustedFitHeight
            ? htmlSafe(`height: ${this.adjustedFitHeight}px;`)
            : null;
    }

    get adjustedFitHeight() {
        return Math.min(this.fitHeight, this.args.maxHeight ?? this.fitHeight);
    }

    get hasWatermark() {
        return this.result?.PEPCode === IJP_OPEN_CODE;
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
        if (this.args.resultId) {
            this.loadAbstract(this.args.resultId);
        }
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
     * Load the abstract
     *
     * @param {string} id
     * @memberof SearchPreview
     */
    async loadAbstract(id: string) {
        try {
            this.loadingBar.show();
            const abstract = await this.store.findRecord('abstract', id);
            this.result = abstract;
        } catch (error) {
            const status = error?.errors?.[0].status;
            if (status === '404') {
                if (status === '404') {
                    this.router.replaceWith('four-oh-four-document', '404');
                }
            }
            console.log(error);
        } finally {
            this.loadingBar.hide();
        }
    }

    /**
     * Set inner element and load the abstract
     * @param {HTMLElement} element
     */
    @action
    async onElementInsert(element: HTMLElement) {
        this.innerElement = element;

        if (this.args.resultId) {
            this.loadAbstract(this.args.resultId);
        }
    }

    /**
     * Reloads the previewed result on open/change, to ensure its displaying the
     * correct content based on their current session/subscription/etc
     */
    @action
    async onResultUpdate() {
        if (this.args.resultId) {
            this.loadAbstract(this.args.resultId);
        }
    }

    /**
     * Sets the preview pane's sizing mode
     * @param {SearchPreviewModeId} mode
     */
    @action
    setMode(mode: SearchPreviewModeId) {
        const previewMode: SearchPreviewMode = { id: mode };
        // reset the calculated fit size in case it was resized
        if (mode === SearchPreviewModeId.FIT) {
            this.updateFitHeight();
        } else if (mode === SearchPreviewModeId.CUSTOM) {
            previewMode.options = {
                height: this.fitHeight
            };
        }

        this.previewPane.updateMode(previewMode);
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
     * When drag resizing starts, set the pane to not animate height changes
     */
    @action
    onDragStart() {
        if (!this.isCustomMode && this.scrollableElement) {
            this.fitHeight = this.scrollableElement.offsetHeight;
            this.previewPane.updateMode({
                id: SearchPreviewModeId.CUSTOM,
                options: {
                    height: this.fitHeight
                }
            });
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
        this.fitHeight = Math.max(this.minFitHeight, this.startingDragHeight - position);
        this.startingDragHeight = 0;
        next(this, () => (this.isDragResizing = false));

        this.previewPane.updateMode({
            id: SearchPreviewModeId.CUSTOM,
            options: {
                height: this.fitHeight
            }
        });
    }

    /**
     * Open the glossary modal to view the term
     *
     * @param {string} term
     * @param {GlossaryTerm} results
     * @memberof ReadDocument
     */
    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm) {
        this.modal.open('glossary', {
            results,
            term
        });
    }

    /**
     * when the document is rendered - if we are in fit mode update the height
     *
     * @memberof SearchPreview
     */
    @action
    documentRendered() {
        if (this.isFitMode) {
            this.updateFitHeight();
        }
    }

    /**
     * View the document
     *
     * @memberof SearchPreview
     */
    @action
    viewDocument() {
        if (this.result) {
            this.args.loadDocument?.(this.result);
        }
    }
}
