import { SEARCH_TYPES } from 'pep/constants/search';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

//TODO move
interface SearchQueryTerm {
    term: string;
    type: string; //TODO should be enum
}

//TODO not using smartSearchTerm yet
export function buildSearchQueryParams(smartSearchTerm: string, searchTerms: SearchQueryTerm[], synonyms: boolean) {
    const queryParams = {
        smartSearchTerm,
        synonyms
    };

    const nonEmptyTerms = searchTerms.filter((t) => !!t.term);

    nonEmptyTerms.forEach((term) => {
        let searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            queryParams[searchType.param] = term.term;
        }
    });

    return removeEmptyQueryParams(queryParams);
}
