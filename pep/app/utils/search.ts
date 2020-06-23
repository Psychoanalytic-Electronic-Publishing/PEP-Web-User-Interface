import { isEmpty } from '@ember/utils';
import { SEARCH_TYPES, SEARCH_FACETS } from 'pep/constants/search';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

const defaultFacetFields = SEARCH_FACETS.mapBy('id');

//TODO move
interface SearchQueryTerm {
    term: string;
    type: string; //TODO should be enum
}

//TODO move
interface SearchQueryFacet {
    value: string;
    id: string; //TODO should be enum
}

//TODO not using smartSearchTerm yet
export function buildSearchQueryParams(
    smartSearchTerm: string,
    searchTerms: SearchQueryTerm[],
    synonyms: boolean,
    facetValues: SearchQueryFacet[] = [],
    facetFields: string[] = defaultFacetFields,
    logicalOperator: 'AND' | 'OR' = 'OR'
) {
    const queryParams = {
        facetfields: !isEmpty(facetFields) ? facetFields.join(',') : null,
        smartSearchTerm,
        synonyms
    };

    const nonEmptyTerms = searchTerms.filter((t) => !!t.term);

    nonEmptyTerms.forEach((term) => {
        let searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            //if a term of this type already exists, join it to the existing one
            if (queryParams[searchType.param]) {
                queryParams[searchType.param] = `${queryParams[searchType.param]} ${logicalOperator} ${term.term}`;
            } else {
                queryParams[searchType.param] = term.term;
            }
        }
    });

    const nonEmptyFacets = facetValues.filter((facet) => !!facet.value);

    //group facets together by id
    const groupedFacets = nonEmptyFacets.reduce((prev, facet) => {
        if (prev[facet.id]) {
            prev[facet.id].push(facet);
        } else {
            prev[facet.id] = [facet];
        }

        return prev;
    }, {});

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
