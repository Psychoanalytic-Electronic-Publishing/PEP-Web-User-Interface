import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class InformationBarService extends Service {
    @tracked messageComponent?: string;

    /**
     * Default base path to the correct component location
     *
     * @memberof InformationBarService
     */
    defaultPath = 'information-bar/bars/';

    /**
     * Is the information bar currently shown
     *
     * @readonly
     * @memberof InformationBarService
     */
    get isShown() {
        return !!this.messageComponent;
    }

    /**
     * Shows the information bar
     */
    show(path: string) {
        this.messageComponent = `${this.defaultPath}${path}`;
    }

    /**
     * Hides the information bar
     */
    hide() {
        this.messageComponent = undefined;
    }

    /**
     * Hide bar on destroy
     *
     * @memberof InformationBarService
     */
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
