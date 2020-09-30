import IntlService from 'ember-intl/services/intl';
import Search from 'pep/pods/search/controller';

import { SearchFacetCounts, groupCountsByRange } from 'pep/utils/search';

/**
 * Accepted query param fields for the /v2/Database/Search endpoint
 * @export
 * @type SearchTermParam
 */
export type SearchTermParam =
    | 'fulltext1'
    | 'paratext'
    | 'parascope'
    | 'sourcetype'
    | 'sourcename'
    | 'sourcecode'
    | 'articletype'
    | 'sourcelangcode'
    | 'author'
    | 'title'
    | 'startyear'
    | 'endyear'
    | 'citecount'
    | 'viewcount'
    | 'viewperiod';

/**
 * Valid values for the viewperiod /v2/Database/Search endpoint (and misc other endpoints)
 * @export
 * @enum {number}
 */
export enum ViewPeriod {
    PAST_CAL_YEAR = 0,
    PAST_WEEK = 1,
    PAST_MONTH = 2,
    PAST_6_MONTHS = 3,
    PAST_12_MONTHS = 4
}

/**
 * Search term fields for the "fielded search" search form inputs
 * @export
 * @enum {string}
 */
export enum SearchTermId {
    EVERYWHERE = 'everywhere',
    AUTHOR = 'author',
    TITLE = 'title',
    DREAM = 'dream',
    QUOTE = 'quote',
    REFERENCE = 'reference',
    DIALOG = 'dialog',
    ARTICLE = 'article',
    START_YEAR = 'startYear',
    END_YEAR = 'endYear',
    CITED = 'cited',
    VIEWED = 'viewed'
}

/**
 * Search facets passed to and returned by the /v2/Database/Search endpoint
 * that allows search results to be further filtered via the "Refine" form
 * @export
 * @enum {string}
 */
export enum SearchFacetId {
    ART_ID = 'art_id',
    ART_TITLE = 'art_title',
    ART_TITLE_XML = 'art_title_xml',
    ART_SUBTITLE_XML = 'art_subtitle_xml',
    ART_AUTHOR_ID = 'art_author_id',
    ART_AUTHORS = 'art_authors',
    ART_CITEAS_XML = 'art_citeas_xml',
    ART_SOURCECODE = 'art_sourcecode',
    ART_SOURCETITLEABBR = 'art_sourcetitleabbr',
    ART_SOURCETITLEFULL = 'art_sourcetitlefull',
    ART_SOURCETYPE = 'art_sourcetype',
    ART_LEVEL = 'art_level',
    PARENT_TAG = 'parent_tag',
    PARA = 'para',
    ART_VOL = 'art_vol',
    ART_TYPE = 'art_type',
    ART_VOL_TITLE = 'art_vol_title',
    ART_YEAR = 'art_year',
    ART_YEAR_INT = 'art_year_int',
    ART_ISS = 'art_iss',
    ART_ISS_TITLE = 'art_iss_title',
    ART_NEWSECNM = 'art_newsecnm',
    ART_PGRG = 'art_pgrg',
    ART_LANG = 'art_lang',
    ART_DOI = 'art_doi',
    ART_ISSN = 'art_issn',
    ART_ORIGRX = 'art_origrx',
    ART_QUAL = 'art_qual',
    ART_KWDS_STR = 'art_kwds_str',
    ART_CITED_ALL = 'art_cited_all',
    ART_CITED_5 = 'art_cited_5',
    ART_CITED_10 = 'art_cited_10',
    ART_CITED_20 = 'art_cited_20',
    ART_VIEWS_LAST12MOS = 'art_views_last12mos',
    REFERENCE_COUNT = 'reference_count',
    FILE_CLASSIFICATION = 'file_classification',
    FILE_LAST_MODIFIED = 'file_last_modified',
    TIMESTAMP = 'timestamp',
    SCORE = 'score',
    GLOSSARY_TERMS = 'glossary_terms',
    GLOSSARY_GROUP_TERMS = 'glossary_group_terms'
}

/**
 * Represents a "fielded search" input's current type and entered text
 * @export
 * @interface SearchTermValue
 */
export interface SearchTermValue {
    type: SearchTermId;
    term: string;
}

/**
 * Represents a selected facet value from the search "Refine" form
 * @export
 * @interface SearchFacetValue
 */
export interface SearchFacetValue {
    id: string;
    value: string;
}

/**
 * Configuration for search term fields used for its display in the UI
 * and when building search queries for it
 * @export
 * @interface SearchTermType
 */
export interface SearchTermType {
    id: SearchTermId;
    param: string;
    solrField?: string;
    scope?: string;
    wordWheelField?: string;
    wordWheelCore?: string;
    label: string;
    shortLabel?: string;
    isTypeOption: boolean;
}

/**
 * Configuration for search facets  used for its display in the UI
 * and when building search queries for it
 * @export
 * @interface SearchFacetType
 */
export interface SearchFacetType {
    id: SearchFacetId;
    param: SearchTermParam;
    paramSeparator: string;
    label: string;
    dynamicValues: boolean;
    prefixValues?: boolean;
    quoteValues?: boolean;
    values: { id: string; label: string }[];
    formatCounts?: (counts: SearchFacetCounts) => SearchFacetCounts;
    formatOption?: (opt: string, intl: IntlService) => string;
}

/**
 * Option for selecting a view period in the search form
 * @export
 * @interface ViewPeriodOption
 */
export interface ViewPeriodOption {
    id: ViewPeriod;
    label: string;
}

export const SEARCH_DEFAULT_FACETS: SearchFacetValue[] = [];

export const SEARCH_DEFAULT_VIEW_PERIOD: ViewPeriod = ViewPeriod.PAST_WEEK;

/**
 * Search term types
 */

export const SEARCH_TYPE_EVERYWHERE: SearchTermType = {
    id: SearchTermId.EVERYWHERE,
    param: 'fulltext1',
    solrField: 'text',
    wordWheelField: 'text',
    wordWheelCore: 'docs',
    label: 'search.terms.everywhere.label',
    isTypeOption: true
};

export const SEARCH_TYPE_AUTHOR: SearchTermType = {
    id: SearchTermId.AUTHOR,
    param: 'author',
    wordWheelField: 'art_authors',
    wordWheelCore: 'docs',
    label: 'search.terms.author.label',
    isTypeOption: true
};

export const SEARCH_TYPE_TITLE: SearchTermType = {
    id: SearchTermId.TITLE,
    param: 'title',
    wordWheelField: 'art_title',
    wordWheelCore: 'docs',
    label: 'search.terms.title.label',
    isTypeOption: true
};

export const SEARCH_TYPE_DREAM: SearchTermType = {
    id: SearchTermId.DREAM,
    param: 'fulltext1',
    solrField: 'dreams_xml',
    scope: 'dreams',
    wordWheelField: 'dreams_xml',
    wordWheelCore: 'docs',
    label: 'search.terms.dream.label',
    isTypeOption: true
};

export const SEARCH_TYPE_QUOTE: SearchTermType = {
    id: SearchTermId.QUOTE,
    param: 'fulltext1',
    solrField: 'quotes_xml',
    wordWheelField: 'quotes_xml',
    wordWheelCore: 'docs',
    label: 'search.terms.quote.label',
    isTypeOption: true
};

export const SEARCH_TYPE_REFERENCE: SearchTermType = {
    id: SearchTermId.REFERENCE,
    param: 'fulltext1',
    solrField: 'references_xml',
    scope: 'biblios',
    wordWheelField: 'references_xml',
    wordWheelCore: 'docs',
    label: 'search.terms.reference.label',
    isTypeOption: true
};

export const SEARCH_TYPE_DIALOG: SearchTermType = {
    id: SearchTermId.DIALOG,
    param: 'fulltext1',
    solrField: 'dialogs_xml',
    scope: 'dialogs',
    wordWheelField: 'dialogs_xml',
    wordWheelCore: 'docs',
    label: 'search.terms.dialog.label',
    isTypeOption: true
};

export const SEARCH_TYPE_ARTICLE: SearchTermType = {
    id: SearchTermId.ARTICLE,
    param: 'fulltext1',
    solrField: 'body_xml',
    scope: 'doc',
    wordWheelField: 'body_xml',
    wordWheelCore: 'docs',
    label: 'search.terms.article.label',
    isTypeOption: true
};

export const SEARCH_TYPE_START_YEAR: SearchTermType = {
    id: SearchTermId.START_YEAR,
    param: 'startyear',
    label: 'search.terms.startYear.label',
    isTypeOption: true
};

// Note: not being used, only using startyear for now
// export const SEARCH_TYPE_END_YEAR: SearchTermType = {
//     id: SearchTermId.END_YEAR,
//     param: 'endyear',
//     label: 'search.terms.endYear.label',
//     isTypeOption: true
// };

export const SEARCH_TYPE_CITED: SearchTermType = {
    id: SearchTermId.CITED,
    param: 'citecount',
    label: 'search.terms.cited.label',
    shortLabel: 'search.terms.cited.shortLabel',
    isTypeOption: false
};

export const SEARCH_TYPE_VIEWED: SearchTermType = {
    id: SearchTermId.VIEWED,
    param: 'viewcount',
    label: 'search.terms.viewed.label',
    shortLabel: 'search.terms.viewed.shortLabel',
    isTypeOption: false
};

export const SEARCH_TYPES: SearchTermType[] = [
    SEARCH_TYPE_EVERYWHERE,
    SEARCH_TYPE_AUTHOR,
    SEARCH_TYPE_TITLE,
    SEARCH_TYPE_DREAM,
    SEARCH_TYPE_QUOTE,
    SEARCH_TYPE_REFERENCE,
    SEARCH_TYPE_DIALOG,
    SEARCH_TYPE_ARTICLE,
    SEARCH_TYPE_START_YEAR,
    SEARCH_TYPE_CITED,
    SEARCH_TYPE_VIEWED
];

/**
 * Search facets
 */

export const SEARCH_FACET_SOURCETYPE: SearchFacetType = {
    id: SearchFacetId.ART_SOURCETYPE,
    param: 'sourcetype',
    paramSeparator: ' OR ',
    label: 'search.facets.art_sourcetype.label',
    dynamicValues: false,
    values: [
        {
            id: 'book',
            label: 'search.facets.art_sourcetype.values.book'
        },
        {
            id: 'journal',
            label: 'search.facets.art_sourcetype.values.journal'
        },
        {
            id: 'videostream',
            label: 'search.facets.art_sourcetype.values.videostream'
        },
        {
            id: 'special',
            label: 'search.facets.art_sourcetype.values.special'
        }
    ]
};

export const SEARCH_FACET_ART_ID: SearchFacetType = {
    id: SearchFacetId.ART_ID,
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: '',
    dynamicValues: true,
    prefixValues: true,
    quoteValues: false,
    values: []
};

export const SEARCH_FACET_SOURCE: SearchFacetType = {
    id: SearchFacetId.ART_SOURCETITLEABBR,
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.art_sourcetitleabbr.label',
    dynamicValues: true,
    prefixValues: true,
    quoteValues: true,
    values: []
};

export const SEARCH_FACET_TYPE: SearchFacetType = {
    id: SearchFacetId.ART_TYPE,
    param: 'articletype',
    paramSeparator: ' OR ',
    label: 'search.facets.art_type.label',
    dynamicValues: false,
    values: [
        {
            id: 'ABS',
            label: 'search.facets.art_type.values.ABS'
        },
        {
            id: 'ANN',
            label: 'search.facets.art_type.values.ANN'
        },
        {
            id: 'ART',
            label: 'search.facets.art_type.values.ART'
        },
        {
            id: 'COM',
            label: 'search.facets.art_type.values.COM'
        },
        {
            id: 'ERA',
            label: 'search.facets.art_type.values.ERA'
        },
        {
            id: 'PRO',
            label: 'search.facets.art_type.values.PRO'
        },
        {
            id: 'REP',
            label: 'search.facets.art_type.values.REP'
        },
        {
            id: 'REV',
            label: 'search.facets.art_type.values.REV'
        },
        {
            id: 'SUP',
            label: 'search.facets.art_type.values.SUP'
        },
        {
            id: 'TOC',
            label: 'search.facets.art_type.values.TOC'
        },
        {
            id: 'VID',
            label: 'search.facets.art_type.values.VID'
        }
    ]
};

export const SEARCH_FACET_LANG: SearchFacetType = {
    id: SearchFacetId.ART_LANG,
    param: 'sourcelangcode',
    paramSeparator: ',',
    label: 'search.facets.art_lang.label',
    dynamicValues: false,
    values: [
        {
            id: 'cs',
            label: 'search.facets.art_lang.values.cs'
        },
        {
            id: 'de',
            label: 'search.facets.art_lang.values.de'
        },
        {
            id: 'el',
            label: 'search.facets.art_lang.values.el'
        },
        {
            id: 'en',
            label: 'search.facets.art_lang.values.en'
        },
        {
            id: 'es',
            label: 'search.facets.art_lang.values.es'
        },
        {
            id: 'fr',
            label: 'search.facets.art_lang.values.fr'
        },
        {
            id: 'he',
            label: 'search.facets.art_lang.values.he'
        },
        {
            id: 'it',
            label: 'search.facets.art_lang.values.it'
        },
        {
            id: 'ko',
            label: 'search.facets.art_lang.values.ko'
        },
        {
            id: 'nl',
            label: 'search.facets.art_lang.values.nl'
        },
        {
            id: 'tr',
            label: 'search.facets.art_lang.values.tr'
        },
        {
            id: 'zh',
            label: 'search.facets.art_lang.values.zh'
        }
    ]
};

// Note: not being used, only using GLOSSARY_GROUP_TERMS for now
// export const SEARCH_FACET_GLOSSARY: SearchFacetType = {
//     id: SearchFacetId.GLOSSARY_TERMS,
//     param: 'fulltext1',
//     paramSeparator: ' OR ',
//     label: 'search.facets.glossary_terms.label',
//     dynamicValues: true,
//     prefixValues: true,
//     values: []
// };

export const SEARCH_FACET_GLOSSARY_GROUPS: SearchFacetType = {
    id: SearchFacetId.GLOSSARY_GROUP_TERMS,
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.glossary_group_terms.label',
    dynamicValues: true,
    prefixValues: true,
    values: []
};

export const SEARCH_FACET_KEYWORDS: SearchFacetType = {
    id: SearchFacetId.ART_KWDS_STR,
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.art_kwds_str.label',
    dynamicValues: true,
    prefixValues: true,
    quoteValues: true,
    values: []
};

export const SEARCH_FACET_DECADE: SearchFacetType = {
    id: SearchFacetId.ART_YEAR_INT,
    param: 'startyear',
    paramSeparator: ' OR ',
    label: 'search.facets.art_year_int.label',
    dynamicValues: true,
    values: [],
    formatCounts: (counts: SearchFacetCounts) => groupCountsByRange(counts, 10),
    formatOption: (opt: string, intl: IntlService) =>
        intl.t('search.facets.art_year_int.option', { year: opt.split('-')?.[0]?.trim() })
};

export const SEARCH_FACET_CITATION: SearchFacetType = {
    id: SearchFacetId.ART_CITED_5,
    param: 'citecount',
    paramSeparator: ' OR ',
    label: 'search.facets.art_cited_5.label',
    dynamicValues: true,
    values: [],
    formatCounts: (counts: SearchFacetCounts) => groupCountsByRange(counts, 10, ' TO ', ' IN 5'),
    formatOption: (opt: string, intl: IntlService) =>
        intl.t('search.facets.art_cited_5.option', {
            range: opt
                .replace('TO', '-')
                .replace('IN 5', '')
                .trim()
        })
};

export const SEARCH_FACET_VIEW: SearchFacetType = {
    id: SearchFacetId.ART_VIEWS_LAST12MOS,
    param: 'viewcount',
    paramSeparator: ' OR ',
    label: 'search.facets.art_views_last12mos.label',
    dynamicValues: true,
    values: [],
    formatCounts: (counts: SearchFacetCounts) => groupCountsByRange(counts, 10, ' TO '),
    formatOption: (opt: string, intl: IntlService) =>
        intl.t('search.facets.art_views_last12mos.option', { range: opt.replace('TO', '-').trim() })
};

export const SEARCH_FACET_AUTHOR: SearchFacetType = {
    id: SearchFacetId.ART_AUTHORS,
    param: 'author',
    paramSeparator: ' OR ',
    label: 'search.facets.art_authors.label',
    dynamicValues: true,
    values: []
};

export const SEARCH_FACET_ART_QUAL: SearchFacetType = {
    id: SearchFacetId.ART_QUAL,
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: '',
    dynamicValues: true,
    prefixValues: true,
    quoteValues: true,
    values: []
};

export const SEARCH_FACETS = [
    SEARCH_FACET_ART_ID,
    SEARCH_FACET_LANG,
    SEARCH_FACET_DECADE,
    SEARCH_FACET_VIEW,
    SEARCH_FACET_CITATION,
    SEARCH_FACET_AUTHOR,
    SEARCH_FACET_TYPE,
    SEARCH_FACET_SOURCETYPE,
    SEARCH_FACET_SOURCE,
    // SEARCH_FACET_GLOSSARY,
    SEARCH_FACET_GLOSSARY_GROUPS,
    SEARCH_FACET_KEYWORDS,
    SEARCH_FACET_ART_QUAL
];

export const VIEW_PERIOD_WEEK: ViewPeriodOption = {
    id: ViewPeriod.PAST_WEEK,
    label: 'search.viewPeriod.week'
};

export const VIEW_PERIOD_CAL_MONTH: ViewPeriodOption = {
    id: ViewPeriod.PAST_MONTH,
    label: 'search.viewPeriod.month'
};

export const VIEW_PERIOD_6_MONTHS: ViewPeriodOption = {
    id: ViewPeriod.PAST_6_MONTHS,
    label: 'search.viewPeriod.6months'
};

export const VIEW_PERIOD_12_MONTHS: ViewPeriodOption = {
    id: ViewPeriod.PAST_12_MONTHS,
    label: 'search.viewPeriod.12months'
};

export const VIEW_PERIOD_CAL_YEAR: ViewPeriodOption = {
    id: ViewPeriod.PAST_CAL_YEAR,
    label: 'search.viewPeriod.calYear'
};

export const VIEW_PERIODS = [
    VIEW_PERIOD_WEEK,
    VIEW_PERIOD_CAL_MONTH,
    VIEW_PERIOD_6_MONTHS,
    VIEW_PERIOD_12_MONTHS,
    VIEW_PERIOD_CAL_YEAR
];

export enum SearchViewType {
    BIBLIOGRAPHIC = 'bibliographic',
    TABLE = 'table'
}

export interface SearchView {
    id: SearchViewType;
    label: string;
}

export const SearchViews: SearchView[] = [
    { id: SearchViewType.BIBLIOGRAPHIC, label: 'Bibliographic' },
    { id: SearchViewType.TABLE, label: 'Table' }
];

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
