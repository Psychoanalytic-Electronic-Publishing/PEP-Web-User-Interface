import { isEmpty, isNone } from '@ember/utils';
import { removeEmptyQueryParams, QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import {
    SEARCH_TYPES,
    SEARCH_FACETS,
    SearchTermValue,
    SearchFacetValue,
    DEFAULT_SEARCH_FACETS,
    ViewPeriod
} from 'pep/constants/search';
import { QUOTED_VALUE_REGEX } from 'pep/constants/regex';

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
    joinOp: 'AND' | 'OR' = 'AND'
): QueryParamsObj {
    const queryParams: SearchQueryParams = {
        facetfields: !isEmpty(facetFields) ? facetFields.join(',') : null,
        smarttext: smartSearchTerm,
        citecount: citedCount,
        viewcount: viewedCount,
        viewperiod: `${!isNone(viewedPeriod) && !isEmpty(viewedCount) ? viewedPeriod : ''}`,
        abstract: true,
        synonyms
    };

    const nonEmptyTerms = searchTerms.filter((t) => !!t.term);
    const parascopes: string[] = [];

    nonEmptyTerms.forEach((term) => {
        let searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            let value = term.term.trim();
            const p = searchType.param as keyof SearchQueryStrParams;

            if (searchType.solrField) {
                const isQuoted = QUOTED_VALUE_REGEX.test(value);
                const hasMultipleWords = value.indexOf(' ') !== -1;
                const formatted = hasMultipleWords && !isQuoted ? `"${value}"~25` : value;
                value = `${searchType.solrField}:(${formatted})`;
            }

            queryParams[p] = joinParamValues(queryParams[p], value, joinOp);

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
            let facetValues = facets.map((f) => (facetType?.quoteValues ? `"${f.value}"` : f.value));
            let values = facetValues.join(facetType.paramSeparator);

            if (facetType.prefixValues) {
                values = `${facetType.id}:(${values})`;
            }

            queryParams[facetType.param] = joinParamValues(queryParams[facetType.param], values, joinOp);
        }
    });

    return removeEmptyQueryParams(queryParams);
}

/**
 * If the query param value already exists, join it to the existing one
 * @export
 * @param {(string | undefined)} currentParam
 * @param {string} newParam
 * @param {('AND' | 'OR')} [joinOperator='AND']
 * @returns {string}
 */
export function joinParamValues(
    currentParam: string | undefined,
    newParam: string,
    joinOperator: 'AND' | 'OR' = 'AND'
) {
    return `${currentParam ? `${currentParam} ${joinOperator} ` : ''}${newParam}`;
}

/**
 * A "blank" search request could have the following params:
 * synonyms, facetfields, and abstract, citecount, viewcount, viewperiod
 * If there are params besides that, it is a valid search form submission
 * @export
 * @param {QueryParamsObj} params
 * @param {string[]} exclude
 * @returns
 */
export function hasSearchQuery(
    params: QueryParamsObj,
    exclude = ['synonyms', 'facetfields', 'abstract', 'citecount', 'viewcount', 'viewperiod']
) {
    return Object.keys(params).filter((p) => !exclude.includes(p)).length > 0;
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
