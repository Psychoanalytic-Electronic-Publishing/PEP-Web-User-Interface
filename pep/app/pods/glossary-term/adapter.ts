import ENV from 'pep/config/environment';
import ApplicationAdapter from 'pep/pods/application/adapter';

export default class GlossaryTerm extends ApplicationAdapter {
    namespace = `${ENV.apiNamespace}/Documents`;

    /**
     * Customize the default model endpoint path
     * @param {String} modelName
     */
    pathForType() {
        return 'Glossary';
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
    urlForQuery<K extends string | number>(
        query: { queryType?: string; return_format?: 'HTML' | 'XML' | 'TEXTONLY'; termIdentifier?: string },
        modelName: K
    ) {
        const newPathSegment = query?.termIdentifier;
        if (query?.termIdentifier) {
            delete query.termIdentifier;
        }
        query.return_format = 'XML';

        const url = super.urlForQuery(query, modelName);
        return url + `/${newPathSegment}`;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        'glossary-term': GlossaryTerm;
    }
}
