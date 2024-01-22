import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

export default class Biblio extends Application {
    urlForFindRecord(id: string) {
        return `${ENV.apiBaseUrl}/v2/Database/Biblio/${id}`;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        biblio: Biblio;
    }
}
