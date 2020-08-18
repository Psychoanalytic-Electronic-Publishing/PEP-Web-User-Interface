import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

import AuthService from 'pep/services/auth';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';

interface SearchPreviewArgs {
    mode: 'minimized' | 'maximized' | 'fit';
    maxHeight?: number;
    result?: Document;
    close: () => void;
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service session!: SessionService;
    @service auth!: AuthService;

    @tracked fitHeight: number = 0;
    innerElement: HTMLElement | null = null;

    get mode() {
        return this.args.mode || 'fit';
    }

    get styles() {
        return this.mode === 'fit' && this.adjustedFitHeight && this.args.result
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
     * Recalculate the content's "fit" height when the result model changes
     */
    @action
    onResultUpdate() {
        scheduleOnce('afterRender', this, this.updateFitHeight);
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
}
