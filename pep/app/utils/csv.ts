import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import { urlForDocumentQuery } from 'pep/pods/document/adapter';
import { serializeQueryParams } from 'pep/utils/url';
import DS from 'ember-data';

export const csvUrl = (store: DS.Store, queryParams: QueryParamsObj) => {
    delete queryParams.limit;
    queryParams.download = true;
    const url = urlForDocumentQuery(store, { queryType: queryParams.queryType });
    return `${url}?${serializeQueryParams(queryParams)}`;
};
