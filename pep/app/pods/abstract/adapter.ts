import { classify } from '@ember/string';
import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

import ApplicationAdapter from 'pep/pods/application/adapter';

export default class Abstract extends ApplicationAdapter {
    /**
     * The endpoint for individual abstracts is /v2/Documents/Abstracts/{id}
     * @param {String} id
     * @param {String | Number} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @returns {String}
     */
    urlForFindRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>): string {
        const modelNameStr = modelName.toString();
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment = `Documents/${origPathSegment}`;
        const url = super.urlForFindRecord(id, modelName, snapshot);
        return url.replace(`/${origPathSegment}`, `/${newPathSegment}`);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        abstract: Abstract;
    }
}
