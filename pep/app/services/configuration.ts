import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';

export default class ConfigurationService extends Service {
    @service store!: DS.Store;

    @tracked base = {};
    @tracked content = {};

    /**
     * Initialize the app by loading the applicable configurations
     */
    setup() {
        //TODO
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        configuration: ConfigurationService;
    }
}
