import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import ConfigurationService from 'pep/services/configuration';

export default class InformationBarService extends Service {
    @service declare configuration: ConfigurationService;
    @tracked messageComponent?: string;
    pollingTimeout: ReturnType<typeof setTimeout> | null = null;
    pollingInterval = 300000;

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

    constructor() {
        super(...arguments);
        this.checkForGlobalMessage();
    }

    destroy() {
        if (this.pollingTimeout) {
            clearTimeout(this.pollingTimeout);
        }

        return this;
    }

    @dontRunInFastboot
    async checkForGlobalMessage() {
        try {
            await this.configuration.setup();
            const hasMessage =
                this.configuration.base.global.notificationMessage ||
                this.configuration.content.global.notificationMessage;
            if (hasMessage) {
                this.messageComponent = this.buildComponentPath('admin-message');
            } else {
                this.messageComponent = undefined;
            }
            this.pollingTimeout = setTimeout(() => this.checkForGlobalMessage(), this.pollingInterval);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Shows the information bar
     */
    show(path: string) {
        this.messageComponent = this.buildComponentPath(path);
    }

    /**
     * Hides the information bar
     */
    hide() {
        this.messageComponent = undefined;
    }

    buildComponentPath(path: string) {
        return `${this.defaultPath}${path}`;
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
