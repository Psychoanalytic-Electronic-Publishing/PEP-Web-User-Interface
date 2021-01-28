import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class InformationBarService extends Service {
    @tracked isShown: boolean = false;
    @tracked messageComponent?: string;

    defaultPath = 'information-bar/bars/';
    /**
     * Shows the loading bar
     */
    show(path: string) {
        this.messageComponent = `${this.defaultPath}${path}`;
    }

    /**
     * Hides the loading bar
     */
    hide() {
        this.messageComponent = undefined;
    }

    willDestroy() {
        this.hide();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'information-bar': InformationBarService;
    }
}
