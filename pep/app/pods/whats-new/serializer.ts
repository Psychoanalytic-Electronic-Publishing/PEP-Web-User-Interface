// import DS from 'ember-data';
import ApplicationSerializer from 'pep/pods/application/serializer';

export default class WhatsNew extends ApplicationSerializer {
    primaryKey = 'volumeURL'; //TODO make sure this is unique
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'whats-new': WhatsNew;
    }
}
