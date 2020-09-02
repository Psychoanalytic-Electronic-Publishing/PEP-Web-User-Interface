import IntlService from 'ember-intl/services/intl';

import { SearchFacetCounts, groupCountsByRange } from 'pep/utils/search';

export const SEARCH_RESULTS_WARNING_COUNT = 200;

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

export enum ViewPeriod {
    PAST_CAL_YEAR = 0,
    PAST_WEEK = 1,
    PAST_MONTH = 2,
    PAST_6_MONTHS = 3,
    PAST_12_MONTHS = 4
}

export interface SearchTermValue {
    type: string;
    term: string;
}

export interface SearchFacetValue {
    id: string;
    value: string;
}

export interface SearchTermType {
    id: string;
    param: string;
    solrField?: string;
    scope?: string;
    label: string;
    shortLabel?: string;
    isTypeOption: boolean;
}

export interface SearchFacetType {
    id: string;
    param: SearchTermParam;
    paramSeparator: string;
    label: string;
    dynamicValues: boolean;
    prefixValues?: boolean;
    values: { id: string; label: string }[];
    formatCounts?: (counts: SearchFacetCounts) => SearchFacetCounts;
    formatOption?: (opt: string, intl: IntlService) => string;
}

export interface ViewPeriodOption {
    id: ViewPeriod;
    label: string;
}

export const SEARCH_DEFAULT_TERMS: SearchTermValue[] = [
    { type: 'everywhere', term: '' },
    { type: 'title', term: '' },
    { type: 'author', term: '' }
];

export const SEARCH_DEFAULT_FACETS: SearchFacetValue[] = [];

export const SEARCH_DEFAULT_VIEW_PERIOD: ViewPeriod = ViewPeriod.PAST_WEEK;

export const SEARCH_DEFAULT_PARAMS = {
    q: '',
    matchSynonyms: false,
    citedCount: '',
    viewedCount: '',
    viewedPeriod: SEARCH_DEFAULT_VIEW_PERIOD,
    //json stringify is workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    searchTerms: JSON.stringify(SEARCH_DEFAULT_TERMS),
    facets: JSON.stringify(SEARCH_DEFAULT_FACETS)
};

/**
 * Search term types
 */

export const SEARCH_TYPE_EVERYWHERE: SearchTermType = {
    id: 'everywhere',
    param: 'fulltext1',
    solrField: 'text',
    label: 'search.terms.everywhere.label',
    isTypeOption: true
};

export const SEARCH_TYPE_AUTHOR: SearchTermType = {
    id: 'author',
    param: 'author',
    label: 'search.terms.author.label',
    isTypeOption: true
};

export const SEARCH_TYPE_TITLE: SearchTermType = {
    id: 'title',
    param: 'title',
    label: 'search.terms.title.label',
    isTypeOption: true
};

export const SEARCH_TYPE_DREAM: SearchTermType = {
    id: 'dream',
    param: 'fulltext1',
    solrField: 'dreams_xml',
    scope: 'dreams',
    label: 'search.terms.dream.label',
    isTypeOption: true
};

export const SEARCH_TYPE_QUOTE: SearchTermType = {
    id: 'quote',
    param: 'fulltext1',
    solrField: 'quotes_xml',
    scope: 'TODO',
    label: 'search.terms.quote.label',
    isTypeOption: true
};

export const SEARCH_TYPE_REFERENCE: SearchTermType = {
    id: 'reference',
    param: 'fulltext1',
    solrField: 'references_xml',
    scope: 'biblios',
    label: 'search.terms.reference.label',
    isTypeOption: true
};

export const SEARCH_TYPE_DIALOG: SearchTermType = {
    id: 'dialog',
    param: 'fulltext1',
    solrField: 'dialogs_xml',
    scope: 'dialogs',
    label: 'search.terms.dialog.label',
    isTypeOption: true
};

export const SEARCH_TYPE_ARTICLE: SearchTermType = {
    id: 'article',
    param: 'fulltext1',
    solrField: 'body_xml',
    scope: 'doc',
    label: 'search.terms.article.label',
    isTypeOption: true
};

export const SEARCH_TYPE_START_YEAR: SearchTermType = {
    id: 'start-year',
    param: 'startyear',
    label: 'search.terms.start-year.label',
    isTypeOption: true
};

// Note: not being used, only using startyear for now
// export const SEARCH_TYPE_END_YEAR: SearchTermType = {
//     id: 'end-year',
//     param: 'endyear',
//     label: 'search.terms.end-year.label',
//     isTypeOption: true
// };

export const SEARCH_TYPE_CITED: SearchTermType = {
    id: 'cited',
    param: 'citecount',
    label: 'search.terms.cited.label',
    shortLabel: 'search.terms.cited.shortLabel',
    isTypeOption: false
};

export const SEARCH_TYPE_VIEWED: SearchTermType = {
    id: 'viewed',
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
 *
 * possible facets:
 * art_id, art_title, art_title_xml, art_subtitle_xml, art_author_id, art_authors, art_citeas_xml, art_sourcecode, art_sourcetitleabbr,
 * art_sourcetitlefull, art_sourcetype, art_level, parent_tag, para, art_vol, art_type, art_vol_title, art_year, art_iss, art_iss_title,
 * art_newsecnm, art_pgrg, art_lang, art_doi, art_issn, art_origrx, art_qual, art_kwds, art_type, art_cited_all, art_cited_5,
 * art_cited_10, art_cited_20, reference_count, file_classification, file_last_modified, timestamp, score
 */
export const DEFAULT_SEARCH_FACETS: string[] = [
    'art_lang',
    'art_year_int',
    'art_sourcetype',
    'art_type',
    'art_sourcetitleabbr',
    'glossary_terms',
    'glossary_group_terms',
    'art_kwds',
    'art_cited_all',
    'art_views_last12mos'
];

export const SEARCH_FACET_SOURCETYPE: SearchFacetType = {
    id: 'art_sourcetype',
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

export const SEARCH_FACET_SOURCE: SearchFacetType = {
    id: 'art_sourcetitleabbr',
    param: 'sourcename',
    paramSeparator: ' OR ',
    label: 'search.facets.art_sourcetitleabbr.label',
    dynamicValues: true,
    values: []
};

export const SEARCH_FACET_TYPE: SearchFacetType = {
    id: 'art_type',
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
    id: 'art_lang',
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

export const SEARCH_FACET_GLOSSARY: SearchFacetType = {
    id: 'glossary_terms',
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.glossary_terms.label',
    dynamicValues: true,
    prefixValues: true,
    values: []
};

export const SEARCH_FACET_GLOSSARY_GROUPS: SearchFacetType = {
    id: 'glossary_group_terms',
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.glossary_group_terms.label',
    dynamicValues: true,
    prefixValues: true,
    values: []
};

export const SEARCH_FACET_KEYWORDS: SearchFacetType = {
    id: 'art_kwds',
    param: 'fulltext1',
    paramSeparator: ' OR ',
    label: 'search.facets.art_kwds.label',
    dynamicValues: true,
    prefixValues: true,
    values: []
};

export const SEARCH_FACET_DECADE: SearchFacetType = {
    id: 'art_year_int',
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
    id: 'art_cited_all',
    param: 'citecount',
    paramSeparator: ' OR ',
    label: 'search.facets.art_cited_all.label',
    dynamicValues: true,
    values: [],
    formatCounts: (counts: SearchFacetCounts) => groupCountsByRange(counts, 10)
};

export const SEARCH_FACET_VIEW: SearchFacetType = {
    id: 'art_views_last12mos',
    param: 'viewcount',
    paramSeparator: ' OR ',
    label: 'search.facets.art_views_last12mos.label',
    dynamicValues: true,
    values: [],
    formatCounts: (counts: SearchFacetCounts) => groupCountsByRange(counts, 10)
};

export const SEARCH_FACETS = [
    SEARCH_FACET_LANG,
    SEARCH_FACET_DECADE,
    SEARCH_FACET_SOURCETYPE,
    SEARCH_FACET_TYPE,
    SEARCH_FACET_SOURCE,
    SEARCH_FACET_GLOSSARY,
    SEARCH_FACET_GLOSSARY_GROUPS,
    SEARCH_FACET_KEYWORDS,
    SEARCH_FACET_CITATION,
    SEARCH_FACET_VIEW
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
