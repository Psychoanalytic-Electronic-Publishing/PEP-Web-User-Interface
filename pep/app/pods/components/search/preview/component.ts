import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { scheduleOnce, next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

import AuthService from 'pep/services/auth';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';

export type SearchPreviewMode = 'minimized' | 'maximized' | 'fit' | 'custom';

interface SearchPreviewArgs {
    mode: SearchPreviewMode;
    maxHeight?: number;
    result?: Document;
    setMode: (mode: SearchPreviewMode) => void;
    close: () => void;
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service session!: SessionService;
    @service auth!: AuthService;

    @tracked fitHeight: number = 0;
    @tracked isDragResizing: boolean = false;

    innerElement: HTMLElement | null = null;
    scrollableElement: HTMLElement | null = null;
    minFitHeight: number = 40;

    get mode() {
        return this.args.mode || 'fit';
    }

    get showMaximize() {
        return this.mode === 'minimized' || this.mode === 'fit';
    }

    get styles() {
        return (this.mode === 'fit' || this.mode === 'custom') && this.adjustedFitHeight && this.args.result
            ? htmlSafe(`height: ${this.adjustedFitHeight}px;`)
            : null;
    }

    get adjustedFitHeight() {
        return Math.min(this.fitHeight, this.args.maxHeight || this.fitHeight);
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
     * Calculate the content's "fit" height on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.innerElement = element;
        scheduleOnce('afterRender', this, this.updateFitHeight);
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
     * Recalculate the content's "fit" height when the result model changes
     */
    @action
    onResultUpdate() {
        if (this.mode === 'fit') {
            scheduleOnce('afterRender', this, this.updateFitHeight);
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
     * When drag resizing starts, set the pane to not animate height changes
     */
    @action
    onDragStart() {
        this.isDragResizing = true;

        if (this.mode !== 'custom' && this.scrollableElement) {
            this.fitHeight = this.scrollableElement.offsetHeight;
            this.args.setMode('custom');
        }
    }

    /**
     * When drag resizing ends, update the pane with the new height
     * @param {number} position
     */
    @action
    onDragEnd(position: number) {
        if (this.mode !== 'custom') {
            this.args.setMode('custom');
        }

        this.fitHeight = Math.max(this.minFitHeight, this.fitHeight - position);
        next(this, () => (this.isDragResizing = false));
    }
}
