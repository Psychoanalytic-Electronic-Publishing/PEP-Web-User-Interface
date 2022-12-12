import { classify } from '@ember/string';

import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

import ENV from 'pep/config/environment';
import ApplicationAdapter, { SnapshotWithQuery } from 'pep/pods/application/adapter';

export type SnapshotWithSearchQuery = SnapshotWithQuery & { adapterOptions: { searchQuery: any; archive?: boolean } };
export default class DocumentAdapter extends ApplicationAdapter {
    modelNameOverride?: string;
    newPathSegmentOverride?: string;
    origPathSegmentOverride?: string;

    /**
     * Depending on the type of document query, the endpoint
     * URL path changes, defaulting to /Search
     * @param {Object} query
     * @param {String | Number} modelName
     * @returns {String}
     */
    urlForQuery<K extends string | number>(
        query: { queryType?: string; formatrequested?: 'HTML' | 'XML' | 'TEXTONLY' },
        modelName: K
    ): string {
        const modelNameStr = this.modelNameOverride ?? modelName.toString();
        const origNamespace = ENV.apiNamespace;
        const newNamespace = `${ENV.apiNamespace}/${ENV.apiDataNamespace}`;
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment = query?.queryType ?? 'Search';
        if (query?.queryType) {
            delete query.queryType;
        }

        // always return XML version of documents
        query.formatrequested = 'XML';

        const url = super.urlForQuery(query, modelName);
        return url
            .replace(`/${origNamespace}`, `/${newNamespace}`)
            .replace(`/${this.origPathSegmentOverride ?? origPathSegment}`, `/${newPathSegment}`);
    }

    /**
     * The endpoint for individual documents is /v2/Documents/Document/{id}
     * @param {String} id
     * @param {String | Number} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @returns {String}
     */
    urlForFindRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>): string {
        // always return XML version of documents
        const snapshotWithQuery = snapshot as unknown as SnapshotWithSearchQuery;
        const adapterOpts = snapshotWithQuery.adapterOptions ?? {};

        const modelNameStr = this.modelNameOverride ?? modelName.toString();
        const origPathSegment = pluralize(classify(modelNameStr));
        const newPathSegment =
            this.newPathSegmentOverride ??
            `${origPathSegment}/${adapterOpts.archive ? 'Archival' : classify(modelNameStr)}`;

        const query = adapterOpts.query ?? {};
        snapshotWithQuery.adapterOptions = { ...adapterOpts, query: { ...query, return_format: 'XML' } };

        let url = super.urlForFindRecord(id, modelName, snapshotWithQuery);
        if (adapterOpts.searchQuery) {
            url += `&${adapterOpts.searchQuery}`;
        }

        url = url.replace(`/${this.origPathSegmentOverride ?? origPathSegment}`, `/${newPathSegment}`);
        console.log(url);

        return url;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        document: DocumentAdapter;
    }
}
