import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LoadingBarService extends Service {
    @tracked isShown: boolean = false;

    /**
     * Shows the loading bar
     */
    show() {
        this.isShown = true;
    }

    /**
     * Hides the loading bar
     */
    hide() {
        this.isShown = false;
    }
}

declare module '@ember/service' {
    interface Registry {
        'loading-bar': LoadingBarService;
    }
}
