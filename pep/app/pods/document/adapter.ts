import { classify } from '@ember/string';
import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

import ENV from 'pep/config/environment';
import ApplicationAdapter from 'pep/pods/application/adapter';

export default class DocumentAdapter extends ApplicationAdapter {
    modelNameOverride?: string;

    /**
     * Depending on the type of document query, the endpoint
     * URL path changes, defaulting to /Search
     * @param {Object} query
     * @param {String | Number} modelName
     * @returns {String}
     */
    urlForQuery<K extends string | number>(query: { queryType?: string }, modelName: K): string {
        const modelNameStr = this.modelNameOverride ?? modelName.toString();
        const origNamespace = ENV.apiNamespace;
        const newNamespace = `${ENV.apiNamespace}/${ENV.apiDataNamespace}`;
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment = query?.queryType ?? 'Search';
        if (query?.queryType) {
            delete query.queryType;
        }

        const url = super.urlForQuery(query, modelName);
        return url
            .replace(`/${origNamespace}`, `/${newNamespace}`)
            .replace(`/${origPathSegment}`, `/${newPathSegment}`);
    }

    /**
     * The endpoint for individual documents is /v2/Documents/Document/{id}
     * @param {String} id
     * @param {String | Number} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @returns {String}
     */
    urlForFindRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>): string {
        const modelNameStr = this.modelNameOverride ?? modelName.toString();
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment = `${origPathSegment}/${classify(modelNameStr)}`;
        const url = super.urlForFindRecord(id, modelName, snapshot);
        return url.replace(`/${origPathSegment}`, `/${newPathSegment}`);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        document: DocumentAdapter;
    }
}
