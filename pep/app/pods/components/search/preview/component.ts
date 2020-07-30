import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { scheduleOnce, next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import AuthService from 'pep/services/auth';

interface SearchPreviewArgs {
    mode: 'minimized' | 'maximized' | 'fit';
    containerSelector: string;
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service session!: SessionService;
    @service auth!: AuthService;

    @tracked fitHeight?: number;
    previewElement: HTMLElement | null = null;

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
    calculateFitHeight() {
        //TODO call this whenever the parent container's dimensions change using ember-did-resize-modifier
        this.fitHeight = 0;
        if (this.previewElement) {
            //dont allow the fit height to be taller than the container height
            const scrollHeight = this.previewElement.scrollHeight;
            const containerEl = document.querySelector(this.args.containerSelector) as HTMLDivElement;
            const containerHeight = containerEl?.offsetHeight;
            const fitHeight = Math.min(scrollHeight, containerHeight || scrollHeight);
            next(this, () => (this.fitHeight = fitHeight));
        }
    }

    /**
     * Calculate the content's "fit" height on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.previewElement = element;
        scheduleOnce('afterRender', this, this.calculateFitHeight);
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
