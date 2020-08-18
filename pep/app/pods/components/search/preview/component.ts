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
    containerSelector: string;
    result?: Document;
    close: () => void;
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service session!: SessionService;
    @service auth!: AuthService;

    @tracked fitHeight?: number;
    innerElement: HTMLElement | null = null;

    get mode() {
        return this.args.mode || 'fit';
    }

    get styles() {
        return this.mode === 'fit' && this.fitHeight ? htmlSafe(`height: ${this.fitHeight}px;`) : null;
    }

    /**
     * Calculates the height that will allow all the content to show w/o scrolling
     * constrained to a maximum height that is the parent container's height
     */
    @dontRunInFastboot
    calculateFitHeight() {
        if (this.innerElement) {
            //dont allow the fit height to be taller than the container height
            const contentHeight = this.innerElement.offsetHeight;
            const containerEl = document.querySelector(this.args.containerSelector) as HTMLDivElement;
            const containerHeight = containerEl?.offsetHeight;
            const fitHeight = Math.min(contentHeight, containerHeight || contentHeight);
            this.fitHeight = fitHeight;
        }
    }

    /**
     * Calculate the content's "fit" height on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.innerElement = element;
        scheduleOnce('afterRender', this, this.calculateFitHeight);
    }

    /**
     * Recalculate the content's "fit" height when the result model changes
     */
    @action
    onResultUpdate() {
        scheduleOnce('afterRender', this, this.calculateFitHeight);
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
