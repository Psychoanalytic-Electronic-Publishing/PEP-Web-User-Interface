// import DS from 'ember-data';
import ApplicationSerializer from '../application/serializer';

export default class Document extends ApplicationSerializer.extend({}) {}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        document: Document;
    }
}
