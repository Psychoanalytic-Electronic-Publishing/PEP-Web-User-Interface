import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';
import Application from 'pep/pods/application/adapter';
import ENV from 'pep/config/environment';

export default class Journal extends Application {
    namespace = `${ENV.apiNamespace}/Metadata`;
    /**
     * Customize the default model endpoint path
     * The endpoint for journals is /v2/Metadata/Journals
     * @param {String} modelName
     */
    pathForType<K extends string | number>(modelName: K) {
        const path = super.pathForType(modelName);
        return pluralize(classify(path));
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        journal: Journal;
    }
}
