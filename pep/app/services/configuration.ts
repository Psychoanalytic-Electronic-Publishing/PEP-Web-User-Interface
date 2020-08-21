import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { BaseConfiguration, ContentConfiguration } from 'pep/constants/configuration';

export default class ConfigurationService extends Service {
    @service store!: DS.Store;

    @tracked base: BaseConfiguration = {};
    @tracked content: ContentConfiguration = {};

    /**
     * Initialize the app by loading the applicable configurations
     */
    async setup() {
        //TODO
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        configuration: ConfigurationService;
    }
}
