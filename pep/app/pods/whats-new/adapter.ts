// import DS from 'ember-data';
import ApplicationAdapter from 'pep/pods/application/adapter';
import ENV from 'pep/config/environment';

export default class WhatsNew extends ApplicationAdapter {
    namespace = `${ENV.apiNamespace}/${ENV.apiDataNamespace}`;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        whatsNew: WhatsNew;
    }
}
