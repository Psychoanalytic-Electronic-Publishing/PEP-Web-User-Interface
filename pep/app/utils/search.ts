import { getOwner } from '@ember/application';
import Controller from '@ember/controller';
import { isEmpty, isNone } from '@ember/utils';

import { QueryParamsObj, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { BOOLEAN_OPERATOR_REGEX, QUOTED_VALUE_REGEX } from 'pep/constants/regex';
import {
    SEARCH_DEFAULT_VIEW_PERIOD,
    SEARCH_FACETS,
    SEARCH_TYPE_AUTHOR,
    SEARCH_TYPES,
    SearchFacetId,
    SearchFacetValue,
    SearchTermId,
    SearchTermValue,
    SourceType,
    ViewPeriod
} from 'pep/constants/search';
import ApplicationController from 'pep/pods/application/controller';
import Document from 'pep/pods/document/model';
import SearchIndexController from 'pep/pods/search/index/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import { guard } from 'pep/utils/types';

/**
 * Search params that come from the sidebar search form
 *
 * @interface SearchQueryStrParams
 */
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
    facetquery?: string;
}

/**
 * Search params that dont come from the search form
 *
 * @interface SearchQueryParams
 * @extends {SearchQueryStrParams}
 */
interface SearchQueryParams extends SearchQueryStrParams {
    facetfields: string | null;
    facetlimit?: number | null;
    facetmincount?: number | null;
    synonyms: boolean;
    abstract: boolean;
    highlightlimit?: number;
}

export interface SearchFacetCounts {
    [x: string]: number;
}

type BuildSearchQueryParams = {
    smartSearchTerm?: string;
    searchTerms?: SearchTermValue[];
    synonyms?: boolean;
    facetValues?: SearchFacetValue[];
    citedCount?: string;
    viewedCount?: string;
    viewedPeriod?: ViewPeriod | null;
    facetFields?: SearchFacetId[];
    joinOp?: 'AND' | 'OR';
    facetLimit?: number | null;
    facetMinCount?: number | null;
    highlightlimit?: number;
    abstract?: boolean;
};

export type SearchController = {
    smartSearchTerm: string;
    matchSynonyms: boolean;
    citedCount: string;
    viewedCount: string;
    viewedPeriod: ViewPeriod;
    isLimitOpen: boolean;
    searchTerms: SearchTermValue[];
};

/**
 * Builds the query params object for document searches
 * @export
 * @param {string} smartSearchTerm
 * @param {SearchTermValue[]} searchTerms
 * @param {boolean} synonyms
 * @param {SearchFacetValue[]} [facetValues=[]]
 * @param {string[]} [facetFields=[]]
 * @param {('AND' | 'OR')} [logicalOperator='OR']
 * @returns {QueryParamsObj}
 */
export function buildSearchQueryParams(searchQueryParams: BuildSearchQueryParams): QueryParamsObj {
    const {
        smartSearchTerm = '',
        searchTerms,
        synonyms = false,
        facetValues = [],
        citedCount = '',
        viewedCount = '',
        viewedPeriod = null,
        facetFields = [],
        joinOp = 'AND',
        facetLimit = null,
        facetMinCount = null,
        highlightlimit,
        abstract
    } = searchQueryParams;

    const queryParams: SearchQueryParams = {
        facetquery: '',
        facetfields: !isEmpty(facetFields) ? facetFields.join(',') : null,
        facetlimit: facetLimit,
        facetmincount: facetMinCount,
        smarttext: smartSearchTerm,
        citecount: citedCount,
        viewcount: viewedCount,
        viewperiod: `${!isNone(viewedPeriod) && !isEmpty(viewedCount) ? viewedPeriod : ''}`,
        abstract: abstract ?? true,
        highlightlimit,
        synonyms
    };

    const nonEmptyTerms = searchTerms?.filter((t) => !!t.term);
    const parascopes: string[] = [];

    const authors = nonEmptyTerms?.filter((term) => term.type === SEARCH_TYPE_AUTHOR.id) ?? [];
    const multipleAuthors = authors.length > 1;
    nonEmptyTerms?.forEach((term) => {
        const searchType = SEARCH_TYPES.findBy('id', term.type);
        if (searchType && searchType.param) {
            let value = term.term.replace(':', ' ').trim();
            const p = searchType.param as keyof SearchQueryStrParams;

            if (searchType.solrField) {
                const isQuoted = QUOTED_VALUE_REGEX.test(value);
                const hasMultipleWords = value.indexOf(' ') !== -1;
                const formatted = hasMultipleWords && !isQuoted ? `"${value}"~25` : value;
                value = `${searchType.solrField}:(${formatted})`;
            }

            const isAuthorType = searchType.id === SEARCH_TYPE_AUTHOR.id;
            // If there is a single author with no boolean operators, wrap in quotes. If multiple authors, wrap in parenthesis.
            // https://github.com/Psychoanalytic-Electronic-Publishing/PEP-Web-User-Interface/issues/410
            if (
                (searchType.quoted && !isAuthorType) ||
                (searchType.quoted && isAuthorType && !(multipleAuthors || BOOLEAN_OPERATOR_REGEX.test(value)))
            ) {
                value = `"${value}"`;
            } else if (searchType.quoted && isAuthorType && (multipleAuthors || BOOLEAN_OPERATOR_REGEX.test(value))) {
                value = `(${value})`;
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
        const facetType = SEARCH_FACETS.findBy('id', id);
        const facets = groupedFacets[id];
        if (facetType && facetType.param) {
            //join all the selected facet values together
            let facetValues = facets.map((f) => (facetType?.quoteValues ? `"${f.value}"` : f.value));
            facetValues = facetValues.map((facet) => (facetType.formatCounts ? `[${facet}]` : facet));

            //wrap all facets in parenthesis
            //https://github.com/Psychoanalytic-Electronic-Publishing/PEP-Web-User-Interface/issues/410
            let values = `(${facetValues.join(facetType.paramSeparator)})`;

            if (facetType.prefixValues) {
                values = `${facetType.id}:${values}`;
            }

            queryParams['facetquery'] = joinParamValues(queryParams['facetquery'], values, joinOp);
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
    newParam: string | string[],
    joinOperator: 'AND' | 'OR' = 'AND'
): string {
    return `${currentParam ? `${currentParam} ${joinOperator} ` : ''}${newParam}`;
}

/**
 * A "blank" search request could have any of the params in the `exclude` arg
 * If there are params besides that, it is a valid search form submission
 * @export
 * @param {QueryParamsObj} params
 * @param {string[]} exclude
 * @returns
 */
export function hasSearchQuery(
    params: QueryParamsObj,
    exclude = [
        'synonyms',
        'facetfields',
        'abstract',
        'viewperiod',
        'facetlimit',
        'facetmincount',
        'formatrequested',
        'highlightlimit'
    ]
): boolean {
    return Object.keys(params).filter((p) => !exclude.includes(p)).length > 0;
}

/**
 * Groups numerical facet count values (e.g. years) by a range
 * @export
 * @param {SearchFacetCounts} counts
 * @param {number} [range=10]
 * @param {string} [separator='-']
 * @param {string} [postfix='']
 * @returns
 */
export function groupCountsByRange(
    counts: SearchFacetCounts,
    range: number = 10,
    separator: string = '-',
    postfix: string = ''
): SearchFacetCounts {
    const values = Object.keys(counts).map((id) => Number(id));
    const countsByRanges: SearchFacetCounts = {};
    values.forEach((v) => {
        const start = Math.floor(v / range) * range;
        const end = start + 9;
        const key = `${start}${separator}${end}${postfix}`;
        countsByRanges[key] = counts[`${v}`] + (countsByRanges[key] ? countsByRanges[key] : 0);
    });
    return countsByRanges;
}

/**
 *
 *
 * @export
 * @param {(Controller & SearchController)} toController
 * @param {Search} searchController
 */
export function copySearchToController(toController: Controller & SearchController): void {
    const searchController = getOwner(toController).lookup(`controller:search.index`);
    const config: ConfigurationService = getOwner(toController).lookup('service:configuration');
    const user: CurrentUserService = getOwner(toController).lookup('service:currentUser');
    const preferences = user.preferences;
    const defaultFields = preferences?.searchTermFields ?? config.base.search.terms.defaultFields;
    const defaultTerms = defaultFields.map((f) => ({ type: f, term: '' }));
    toController.smartSearchTerm = searchController.currentSmartSearchTerm;
    toController.matchSynonyms = searchController.matchSynonyms;
    toController.citedCount = searchController.citedCount;
    toController.viewedCount = searchController.viewedCount;
    toController.viewedPeriod = searchController.viewedPeriod;
    toController.isLimitOpen = searchController.isLimitOpen;
    toController.searchTerms = searchController.currentSearchTerms.length
        ? searchController.currentSearchTerms
        : defaultTerms;
}

/**
 * Clear search from current context and the search index controller
 *
 * @export
 * @param {*} owner
 */
export function clearSearch(owner: any): void {
    const configuration: ConfigurationService = getOwner(owner).lookup('service:configuration');
    const user: CurrentUserService = getOwner(owner).lookup('service:currentUser');
    const searchController: SearchIndexController = getOwner(owner).lookup('controller:search.index');
    const applicationController: ApplicationController = getOwner(owner).lookup('controller:application');
    const cfg = configuration.base.search;
    const preferences = user.preferences;
    const terms =
        (preferences?.userSearchFormSticky ? preferences?.searchTermFields : cfg.terms.defaultFields) ??
        cfg.terms.defaultFields;
    const isLimitOpen =
        (preferences?.userSearchFormSticky ? preferences?.searchLimitIsShown : cfg.limitFields.isShown) ??
        cfg.limitFields.isShown;

    const blankTerms = terms.map((f) => ({ type: f, term: '' }));

    const controllers: [ApplicationController, SearchIndexController] = [applicationController, searchController];
    controllers.forEach((controller) => {
        controller.matchSynonyms = false;
        controller.citedCount = '';
        controller.viewedCount = '';
        controller.viewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
        controller.isLimitOpen = isLimitOpen;
        controller.searchTerms = blankTerms;
        if (guard<SearchIndexController>(controller, 'currentSmartSearchTerm')) {
            clearSearchIndexControllerSearch(controller);
        } else {
            controller.smartSearchTerm = '';
        }
    });
}

/**
 * Clear the search from the search index controller
 *
 * @export
 * @param {SearchIndexController} controller
 */
export function clearSearchIndexControllerSearch(controller: SearchIndexController): void {
    const configuration: ConfigurationService = getOwner(controller).lookup('service:configuration');
    const user: CurrentUserService = getOwner(controller).lookup('service:currentUser');
    const cfg = configuration.base.search;
    const preferences = user.preferences;
    const terms =
        (preferences?.userSearchFormSticky ? preferences?.searchTermFields : cfg.terms.defaultFields) ??
        cfg.terms.defaultFields;
    const blankTerms = terms.map((f) => ({ type: f, term: '' }));

    controller.q = '';
    controller.currentSmartSearchTerm = '';
    controller.currentSearchTerms = blankTerms;
    controller.currentMatchSynonyms = false;
    controller.currentCitedCount = '';
    controller.currentViewedCount = '';
    controller.currentViewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    controller.currentFacets = [];
}

/**
 * Copy any object to a controller
 *
 * @export
 * @template ControllerInstance
 * @param {*} object
 * @param {ControllerInstance} controller
 */
export function copyToController<ControllerInstance>(object: any, controller: ControllerInstance): void {
    Object.assign(controller, object);
}

/**
 * Get query params from the `search.index` controller
 *
 * @export
 * @param {Controller} toController
 * @return {*}
 */
export function getSearchQueryParams(toController: Controller): any {
    const searchController = getOwner(toController).lookup(`controller:search.index`) as Controller & SearchController;
    return searchController.queryParams;
}

/**
 * Build the left hand column search for when you read documents in browse mode
 *
 * @export
 * @param {string} id
 * @return {*}  {{
 *     facetValues: {
 *         id: SearchFacetId;
 *         value: string;
 *     }[];
 *     abstract: boolean;
 * }}
 */
export function buildBrowseRelatedDocumentsParams(
    model: Document
): {
    facetValues?: {
        id: SearchFacetId;
        value: string;
    }[];
    searchTerms?: SearchTermValue[];
    abstract: boolean;
} {
    if (model.sourceType === SourceType.VIDEO_STREAM) {
        return {
            facetValues: [
                {
                    id: SearchFacetId.ART_SOURCETYPE,
                    value: SourceType.VIDEO_STREAM
                }
            ],
            abstract: false
        };
    } else {
        const terms = model.id.split('.');
        return {
            searchTerms: [
                {
                    type: SearchTermId.VOLUME,
                    term: typeof terms[1] === 'string' ? terms[1] : Number(terms[1]).toString()
                },
                {
                    type: SearchTermId.SOURCE_CODE,
                    term: terms[0]
                }
            ],
            abstract: false
        };
    }
}
