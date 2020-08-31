import { isEmpty } from '@ember/utils';
import { removeEmptyQueryParams, QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import {
    SEARCH_TYPES,
    SEARCH_FACETS,
    SearchTermValue,
    SearchFacetValue,
    DEFAULT_SEARCH_FACETS,
    ViewPeriod
} from 'pep/constants/search';

interface SearchQueryStrParams {
    smarttext: string;
    fulltext1?: string;
    parascope?: string;
    paratext?: string;
    author?: string;
    sourcetype?: string;
    articletype?: string;
    sourcecode?: string;
    sourcename?: string;
    sourcelangcode?: string;
    title?: string;
    volume?: string;
    issue?: string;
    startyear?: string;
    endyear?: string;
    citecount?: string;
    viewcount?: string;
    viewperiod?: string;
}

interface SearchQueryParams extends SearchQueryStrParams {
    facetfields: string | null;
    synonyms: boolean;
    abstract: boolean;
}

export interface SearchFacetCounts {
    [x: string]: number;
}

/**
 * Builds the query params object for document searches
 * @export
 * @param {string} smartSearchTerm
 * @param {SearchTermValue[]} searchTerms
 * @param {boolean} synonyms
 * @param {SearchFacetValue[]} [facetValues=[]]
 * @param {string[]} [facetFields=DEFAULT_SEARCH_FACETS]
 * @param {('AND' | 'OR')} [logicalOperator='OR']
 * @returns {QueryParamsObj}
 */
export function buildSearchQueryParams(
    smartSearchTerm: string,
    searchTerms: SearchTermValue[],
    synonyms: boolean,
    facetValues: SearchFacetValue[] = [],
    citedCount: string = '',
    viewedCount: string = '',
    viewedPeriod: ViewPeriod | null = null,
    facetFields: string[] = DEFAULT_SEARCH_FACETS,
    logicalOperator: 'AND' | 'OR' = 'OR'
): QueryParamsObj {
    const queryParams: SearchQueryParams = {
        facetfields: !isEmpty(facetFields) ? facetFields.join(',') : null,
        smarttext: smartSearchTerm,
        citecount: citedCount,
        viewcount: viewedCount,
        viewperiod: `${viewedPeriod ?? ''}`,
        abstract: true,
        synonyms
    };

    const nonEmptyTerms = searchTerms.filter((t) => !!t.term);
    const parascopes: string[] = [];

    nonEmptyTerms.forEach((term) => {
        let searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            //if a term of this type already exists, join it to the existing one
            const p = searchType.param as keyof SearchQueryStrParams;
            if (queryParams[p]) {
                //TODO do multiple paratext param values get joined in the same way?
                queryParams[p] = `${queryParams[p]} ${logicalOperator} ${term.term}`;
            } else {
                queryParams[p] = term.term;
            }

            //add any parascope-based params to query
            if (searchType.scope) {
                parascopes.push(searchType.scope);
            }
        }
    });

    if (parascopes.length > 0) {
        queryParams.parascope = parascopes.join(',');
    }

    // apply any passed in facet values to the search query
    const nonEmptyFacets = facetValues.filter((facet) => !!facet.value);

    //group facets together by id
    const groupedFacets = nonEmptyFacets.reduce(
        (prev: { [x: string]: SearchFacetValue[] }, facet: SearchFacetValue) => {
            if (prev[facet.id]) {
                prev[facet.id].push(facet);
            } else {
                prev[facet.id] = [facet];
            }

            return prev;
        },
        {}
    );

    Object.keys(groupedFacets).forEach((id) => {
        let facetType = SEARCH_FACETS.findBy('id', id);
        let facets = groupedFacets[id];
        if (facetType && facetType.param) {
            //join all the selected facet values together
            let facetValues = facets.mapBy('value').join(facetType.paramSeparator);
            //if the query param already exists, join it to the existing one
            if (queryParams[facetType.param]) {
                queryParams[facetType.param] = `${queryParams[facetType.param]} AND ${facetValues}`;
            } else {
                queryParams[facetType.param] = facetValues;
            }
        }
    });

    return removeEmptyQueryParams(queryParams);
}

/**
 * A "blank" search request could have the following params:
 * synonyms, facetfields, and abstract, citecount, viewcount, viewperiod
 * If there are params besides that, it is a valid search form submission
 * @export
 * @param {QueryParamsObj} params
 * @returns
 */
export function hasSearchQuery(params: QueryParamsObj) {
    const strippedParams = { ...params };
    delete strippedParams.synonyms;
    delete strippedParams.facetfields;
    delete strippedParams.abstract;
    delete strippedParams.citecount;
    delete strippedParams.viewcount;
    delete strippedParams.viewperiod;
    return Object.keys(strippedParams).length > 0;
}

/**
 * Groups numerical facet count values (e.g. years) by a range
 * @export
 * @param {SearchFacetCounts} counts
 * @param {number} [range=10]
 * @returns
 */
export function groupCountsByRange(counts: SearchFacetCounts, range: number = 10) {
    const values = Object.keys(counts).map((id) => Number(id));
    const countsByRanges: SearchFacetCounts = {};
    values.forEach((v) => {
        const start = Math.floor(v / range) * range;
        const end = start + 9;
        const key = `${start} - ${end}`;
        countsByRanges[key] = counts[`${v}`] + (countsByRanges[key] ? countsByRanges[key] : 0);
    });
    return countsByRanges;
}
