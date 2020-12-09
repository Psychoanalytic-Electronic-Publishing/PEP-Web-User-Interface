import DocumentAdapter from '../document/adapter';

export default class Abstract extends DocumentAdapter {
    // modelNameOverride = 'document';
    origPathSegmentOverride = 'Abstracts';
    newPathSegmentOverride = 'Documents/Abstracts';
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        abstract: Abstract;
    }
}
