import Document from 'pep/pods/document/serializer';

export default class Abstract extends Document {}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        abstract: Abstract;
    }
}
