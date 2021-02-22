import ENV from 'pep/config/environment';
import ApplicationAdapter from 'pep/pods/application/adapter';

export default class Configuration extends ApplicationAdapter {
    namespace = `${ENV.apiNamespace}/Client`;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        configuration: Configuration;
    }
}
