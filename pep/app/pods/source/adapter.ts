import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

export default class Source extends Application {
    namespace = `${ENV.apiNamespace}/Metadata`;
    /**
     * Customize the default model endpoint path
     * The endpoint for journals is /v2/Metadata/Contents
     * @param {String} modelName
     */
    pathForType() {
        return 'Contents';
    }

    /**
     * For the the query endpoint for glossary terms we need to send in an ID or search term at the
     * end of the path before the query params
     *
     * @template K
     * @param {{ termIdentifier?: string }} query
     * @param {K} modelName
     * @returns {string}
     * @memberof GlossaryTerm
     */
    urlForQuery<K extends string | number>(query: { queryType?: string; sourceCode?: string }, modelName: K) {
        const newPathSegment = query?.sourceCode;
        if (query?.sourceCode) {
            delete query.sourceCode;
        }

        const url = super.urlForQuery(query, modelName);
        return `${url}/${newPathSegment}`;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        source: Source;
    }
}
