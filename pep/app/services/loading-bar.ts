import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LoadingBar extends Service {
    @tracked isShown: boolean = false;

    show() {
        this.isShown = true;
    }

    hide() {
        this.isShown = false;
    }
}

declare module '@ember/service' {
    interface Registry {
        'loading-bar': LoadingBar;
    }
}
