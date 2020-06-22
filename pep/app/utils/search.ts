import { isEmpty } from '@ember/utils';
import { SEARCH_TYPES } from 'pep/constants/search';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

//TODO move
interface SearchQueryTerm {
    term: string;
    type: string; //TODO should be enum
}

//TODO not using smartSearchTerm yet
export function buildSearchQueryParams(
    smartSearchTerm: string,
    searchTerms: SearchQueryTerm[],
    synonyms: boolean,
    facetFields: string[] = ['art_sourcetype'],
    logicalOperator: 'AND' | 'OR' = 'OR'
) {
    const queryParams = {
        facefields: !isEmpty(facetFields) ? facetFields.join(',') : null,
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

    return removeEmptyQueryParams(queryParams);
}
