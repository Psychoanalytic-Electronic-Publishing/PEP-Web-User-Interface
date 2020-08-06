import { isEmpty } from '@ember/utils';
import { SEARCH_TYPES, SEARCH_FACETS, SearchTermValue, SearchFacetValue } from 'pep/constants/search';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

const defaultFacetFields = SEARCH_FACETS.mapBy('id');

interface SearchQueryStrParams {
    fulltext1: string;
    author?: string;
    sourcetype?: string;
    articletype?: string;
    sourcelangcode?: string;
    title?: string;
    startyear?: string;
    endyear?: string;
    citecount?: string;
    viewcount?: string;
}

interface SearchQueryParams extends SearchQueryStrParams {
    facetfields: string | null;
    synonyms: boolean;
}

export function buildSearchQueryParams(
    smartSearchTerm: string,
    searchTerms: SearchTermValue[],
    synonyms: boolean,
    facetValues: SearchFacetValue[] = [],
    facetFields: string[] = defaultFacetFields,
    logicalOperator: 'AND' | 'OR' = 'OR'
) {
    const queryParams: SearchQueryParams = {
        facetfields: !isEmpty(facetFields) ? facetFields.join(',') : null,
        fulltext1: smartSearchTerm,
        synonyms
    };

    const nonEmptyTerms = searchTerms.filter((t) => !!t.term);

    nonEmptyTerms.forEach((term) => {
        let searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            //if a term of this type already exists, join it to the existing one
            const p = searchType.param as keyof SearchQueryStrParams;
            if (queryParams[p]) {
                queryParams[p] = `${queryParams[p]} ${logicalOperator} ${term.term}`;
            } else {
                queryParams[p] = term.term;
            }
        }
    });

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
