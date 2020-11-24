import DocumentSerializer from '../document/serializer';

export default class SourceVolume extends DocumentSerializer {}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'source-volume': SourceVolume;
    }
}
