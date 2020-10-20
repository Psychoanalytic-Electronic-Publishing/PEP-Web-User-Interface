import { SORT_DASH_REGEX } from 'pep/constants/regex';

export enum APISortDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

export enum SearchTableSortFields {
    AUTHOR_MAST = 'authorMast',
    YEAR = 'year',
    TITLE = 'title',
    DOCUMENT_REF = 'documentRef'
}

export enum SearchSortType {
    BIBLIOGRAPHIC = 'bibliographic',
    YEAR = 'year',
    AUTHOR = 'author',
    TITLE = 'title',
    SOURCE = 'source',
    CITATIONS = 'citations',
    VIEWS = 'views',
    TOC = 'toc',
    SCORE = 'score',
    CITE_COUNT = 'citecount',
    RANK = 'rank'
}

export interface SearchSort {
    id: SearchSortType;
    label: string;
}

export const SearchSorts = [
    { id: SearchSortType.BIBLIOGRAPHIC, label: 'Bibliographic' },
    { id: SearchSortType.YEAR, label: 'Year' },
    { id: SearchSortType.AUTHOR, label: 'Author' },
    { id: SearchSortType.TITLE, label: 'Title' },
    { id: SearchSortType.SOURCE, label: 'Source' },
    { id: SearchSortType.CITATIONS, label: 'Citation Count' },
    { id: SearchSortType.VIEWS, label: 'View Count' },
    { id: SearchSortType.TOC, label: 'Vol/Issue/Page' },
    { id: SearchSortType.SCORE, label: 'Search Score' }
];

/**
 * Transform the sort to a format the api can handle
 *
 * @export
 * @param {string[]} sorts
 * @returns {string[]}
 */
export function transformSearchSortToAPI(sorts: string[]) {
    const sort = sorts[0];
    const transformedSort = transformSortDirectionToAPI(sort);
    return [transformedSort];
}

/**
 * Transform the sort to a format the table can handle
 *
 * @export
 * @param {string[]} [sorts]
 * @returns {TableSort[] | undefined}
 */
export function transformSearchSortsToTable(sorts?: string[]) {
    return sorts?.map((sort) => {
        const sortValue = sort.split(' ');
        const name = sortValue[0];
        let transformedName = '';

        const tableSort = transformSortDirectionToTable(sort);

        if (name === SearchSortType.AUTHOR) {
            transformedName = SearchTableSortFields.AUTHOR_MAST;
        } else if (name === SearchSortType.YEAR) {
            transformedName = SearchTableSortFields.YEAR;
        } else if (name === SearchSortType.TITLE) {
            transformedName = SearchTableSortFields.TITLE;
        } else {
            transformedName = SearchTableSortFields.DOCUMENT_REF;
        }

        return {
            ...tableSort,
            valuePath: transformedName
        };
    });
}

/**
 * Transform sort and direction to tables format
 *
 * @export
 * @param {string} sort
 * @returns {TableSort}
 */
export function transformSortDirectionToTable(sort: string) {
    const sortValue = sort.split(' ');
    const name = sortValue[0];
    const direction = sortValue[1];
    return {
        valuePath: name,
        isAscending: direction === APISortDirection.DESCENDING ? false : true
    };
}

/**
 * Transform sort direction to api format
 *
 * @export
 * @param {string} sort
 * @returns {string}
 */
export function transformSortDirectionToAPI(sort: string) {
    const sortWithoutDirection = sort.replace(SORT_DASH_REGEX, '');
    return sort.indexOf('-') !== -1
        ? `${sortWithoutDirection} ${APISortDirection.DESCENDING}`
        : `${sortWithoutDirection} ${APISortDirection.ASCENDING}`;
}
