import DocumentAdapter from 'pep/pods/document/adapter';

export default class SearchDocumentAdapter extends DocumentAdapter {
    modelNameOverride = 'document';

    /**
     * Customize the default model endpoint path
     */
    pathForType() {
        return 'Documents';
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        'search-document': Document;
    }
}
