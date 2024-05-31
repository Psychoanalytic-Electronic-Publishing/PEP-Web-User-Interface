import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

export default class Status extends Application {
    urlForQueryRecord() {
        return `${ENV.apiBaseUrl}/v2/Session/Status`;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        status: Status;
    }
}
