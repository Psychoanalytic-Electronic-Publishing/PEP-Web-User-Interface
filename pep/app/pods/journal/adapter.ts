import DS from 'ember-data';
import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';
import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';
export default class Journal extends Application {
    namespace = 'v2/Metadata';
    pathForType(modelName: string | number) {
        return pluralize(classify(modelName as string));
    }

    // /**
    //  * Depending on the type of document query, the endpoint
    //  * URL path changes, defaulting to /Search
    //  * @param {Object} query
    //  * @param {String | Number} modelName
    //  * @returns {String}
    //  */
    // urlForQuery<K extends string | number>(query: { queryType: string }, modelName: K): string {
    //     const modelNameStr = modelName.toString();
    //     const origNamespace = ENV.apiNamespace;
    //     const newNamespace = `${ENV.apiNamespace}/${ENV.apiDataNamespace}`;
    //     const origPathSegment = pluralize(classify(modelNameStr));
    //     const newPathSegment = query?.queryType ?? 'Search';
    //     if (query?.queryType) {
    //         delete query.queryType;
    //     }

    //     const url = super.urlForQuery(query, modelName);
    //     return url
    //         .replace(`/${origNamespace}`, `/${newNamespace}`)
    //         .replace(`/${origPathSegment}`, `/${newPathSegment}`);
    // }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        journal: Journal;
    }
}
