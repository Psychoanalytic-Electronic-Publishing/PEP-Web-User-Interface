import DocumentSerializer from 'pep/pods/document/serializer';

export default class SearchDocumentSerializer extends DocumentSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'search-document': SearchDocumentSerializer;
    }
}
