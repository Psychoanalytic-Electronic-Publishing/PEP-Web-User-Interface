// import DS from 'ember-data';
import ApplicationAdapter from '../application/adapter';
import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';

export default class Document extends ApplicationAdapter {
    /**
     * Depending on the type of document query, the endpoint
     * URL path changes, defaulting to /Search
     * @param {Object} query
     * @param {String | Number} modelName
     */
    urlForQuery<K extends string | number>(query: { queryType: string }, modelName: K) {
        const modelNameStr = modelName.toString();
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment = query?.queryType ?? 'Search';
        if (query?.queryType) {
            delete query.queryType;
        }

        const url = super.urlForQuery(query, modelName);
        return url.replace(`/${origPathSegment}`, `/${newPathSegment}`);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        document: Document;
    }
}
