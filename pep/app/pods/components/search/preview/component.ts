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

    get mode() {
        return this.args.mode || 'fit';
    }

    get styles() {
        return this.mode === 'fit' && this.fitHeight ? htmlSafe(`height: ${this.fitHeight}px;`) : null;
    }

    //TODO this should be called again whenever the browser window size changes, using ember-resize's Resize service
    calculateFitHeight() {
        this.fitHeight = 0;
        if (this.previewElement) {
            //dont allow the fit height to be taller than the container height
            const scrollHeight = this.previewElement.scrollHeight;
            const containerHeight = document.querySelector(this.args.containerSelector)?.offsetHeight;
            const fitHeight = Math.min(scrollHeight, containerHeight || scrollHeight);
            next(this, () => (this.fitHeight = fitHeight));
        }
    }

    @action
    onElementInsert(element) {
        this.previewElement = element;
        scheduleOnce('afterRender', this, this.calculateFitHeight);
    }

    @action
    login(event) {
        event.preventDefault();
        return this.auth.openLoginModal(true);
    }
}
