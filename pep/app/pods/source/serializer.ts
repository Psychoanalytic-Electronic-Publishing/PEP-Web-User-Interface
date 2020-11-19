import DocumentSerializer from '../document/serializer';

export default class Source extends DocumentSerializer {}
// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        source: Source;
    }
}
