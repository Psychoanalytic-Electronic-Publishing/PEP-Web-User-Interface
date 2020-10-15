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

export enum SearchSort {
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

export const SearchSorts = [
    { id: SearchSort.BIBLIOGRAPHIC, label: 'Bibliographic' },
    { id: SearchSort.YEAR, label: 'Year' },
    { id: SearchSort.AUTHOR, label: 'Author' },
    { id: SearchSort.TITLE, label: 'Title' },
    { id: SearchSort.SOURCE, label: 'Source' },
    { id: SearchSort.CITATIONS, label: 'Citation Count' },
    { id: SearchSort.VIEWS, label: 'View Count' },
    { id: SearchSort.TOC, label: 'Vol/Issue/Page' },
    { id: SearchSort.SCORE, label: 'Search Score' }
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
    const sortWithoutDirection = sorts[0].replace(SORT_DASH_REGEX, '');
    let name = '';
    if (sortWithoutDirection === SearchTableSortFields.AUTHOR_MAST) {
        name = SearchSort.AUTHOR;
    } else if (sortWithoutDirection === SearchTableSortFields.YEAR) {
        name = SearchSort.YEAR;
    } else if (sortWithoutDirection === SearchTableSortFields.TITLE) {
        name = SearchSort.TITLE;
    } else {
        name = SearchSort.SOURCE;
    }
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

        if (name === SearchSort.AUTHOR) {
            transformedName = SearchTableSortFields.AUTHOR_MAST;
        } else if (name === SearchSort.YEAR) {
            transformedName = SearchTableSortFields.YEAR;
        } else if (name === SearchSort.TITLE) {
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
