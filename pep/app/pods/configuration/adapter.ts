import DS from 'ember-data';
import ENV from 'pep/config/environment';

export default class Configuration extends DS.JSONAPIAdapter {
    namespace = `${ENV.apiNamespace}/${ENV.apiAdminNamespace}/Client`;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        configuration: Configuration;
    }
}
