/**
 * Search term types
 */

export const SEARCH_TYPE_EVERYWHERE = {
    id: 'everywhere',
    param: 'fulltext1',
    label: 'Everywhere'
};

export const SEARCH_TYPE_AUTHOR = {
    id: 'author',
    param: 'author',
    label: 'Author'
};

export const SEARCH_TYPE_TITLE = {
    id: 'title',
    param: 'title',
    label: 'Title'
};

export const SEARCH_TYPE_FREUD = {
    id: 'freud',
    label: "Freud's Work*"
};

export const SEARCH_TYPE_GLOSSARY = {
    id: 'glossary',
    label: 'PEP Glossary*'
};

export const SEARCH_TYPE_DIALOG = {
    id: 'dialog',
    label: 'Dialogs*'
};

export const SEARCH_TYPE_QUOTE = {
    id: 'quote',
    label: 'Quotes*'
};

export const SEARCH_TYPE_START_YEAR = {
    id: 'start-year',
    param: 'startyear',
    label: 'Start Year'
};

export const SEARCH_TYPE_END_YEAR = {
    id: 'end-year',
    param: 'endyear',
    label: 'End Year'
};

export const SEARCH_TYPE_BIBLIO = {
    id: 'bibliography',
    label: 'Bilbiographies*'
};

export const SEARCH_TYPE_CITED = {
    id: 'cited',
    param: 'citecount',
    label: 'Cited this many times',
    shortLabel: 'Cited #'
};

export const SEARCH_TYPE_VIEWED = {
    id: 'viewed',
    param: 'viewcount',
    label: 'Viewed this many times',
    shortLabel: 'Viewed #'
};

export const SEARCH_TYPE_SCHOLAR = {
    id: 'scholar',
    label: 'Google Scholar*'
};

export const SEARCH_TYPES = [
    SEARCH_TYPE_EVERYWHERE,
    SEARCH_TYPE_AUTHOR,
    SEARCH_TYPE_TITLE,
    SEARCH_TYPE_FREUD,
    SEARCH_TYPE_GLOSSARY,
    SEARCH_TYPE_DIALOG,
    SEARCH_TYPE_QUOTE,
    SEARCH_TYPE_START_YEAR,
    SEARCH_TYPE_END_YEAR,
    SEARCH_TYPE_BIBLIO,
    SEARCH_TYPE_CITED,
    SEARCH_TYPE_VIEWED,
    SEARCH_TYPE_SCHOLAR
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

export const SEARCH_FACET_SOURCETYPE = {
    id: 'art_sourcetype',
    param: 'sourcetype',
    paramSeparator: ' OR ',
    label: 'Source Type',
    dynamicValues: false,
    values: [
        {
            id: 'book',
            label: 'Book'
        },
        {
            id: 'journal',
            label: 'Journal'
        },
        {
            id: 'videostream',
            label: 'Video'
        },
        {
            id: 'special',
            label: 'Special'
        }
    ]
};

export const SEARCH_FACET_TYPE = {
    id: 'art_type',
    param: 'articletype',
    paramSeparator: ' OR ',
    label: 'Article Type',
    dynamicValues: false,
    values: [
        {
            id: 'ABS',
            label: 'Abstract'
        },
        {
            id: 'ANN',
            label: 'Announcement'
        },
        {
            id: 'ART',
            label: 'Article'
        },
        {
            id: 'COM',
            label: 'Commentary'
        },
        {
            id: 'ERA',
            label: 'Errata'
        },
        {
            id: 'PRO',
            label: 'Profile'
        },
        {
            id: 'REP',
            label: 'Report'
        },
        {
            id: 'REV',
            label: 'Review'
        },
        {
            id: 'SUP',
            label: 'SUP'
        },
        {
            id: 'TOC',
            label: 'TOC'
        },
        {
            id: 'VID',
            label: 'Video'
        }
    ]
};

export const SEARCH_FACET_LANG = {
    id: 'art_lang',
    param: 'sourcelangcode',
    paramSeparator: ',',
    label: 'Language',
    dynamicValues: false,
    values: [
        {
            id: 'cs',
            label: 'Czech'
        },
        {
            id: 'de',
            label: 'German'
        },
        {
            id: 'el',
            label: 'Greek'
        },
        {
            id: 'en',
            label: 'English'
        },
        {
            id: 'es',
            label: 'Spanish'
        },
        {
            id: 'fr',
            label: 'French'
        },
        {
            id: 'he',
            label: 'Hebrew'
        },
        {
            id: 'it',
            label: 'Italian'
        },
        {
            id: 'ko',
            label: 'Korean'
        },
        {
            id: 'nl',
            label: 'Dutch'
        },
        {
            id: 'tr',
            label: 'Turkish'
        },
        {
            id: 'zh',
            label: 'Chinese'
        }
    ]
};

export const SEARCH_FACET_KEYWORDS = {
    id: 'art_kwds',
    param: 'fulltext1', //TODO is this the right query param to put these values in?
    paramSeparator: ' OR ',
    label: 'Keywords',
    dynamicValues: true,
    values: []
};

export const SEARCH_FACETS = [SEARCH_FACET_SOURCETYPE, SEARCH_FACET_TYPE, SEARCH_FACET_LANG, SEARCH_FACET_KEYWORDS];
