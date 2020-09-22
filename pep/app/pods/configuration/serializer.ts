import ApplicationSerializer from 'pep/pods/application/serializer';

export default class Configuration extends ApplicationSerializer {
    primaryKey = 'configName';
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        configuration: Configuration;
    }
}
