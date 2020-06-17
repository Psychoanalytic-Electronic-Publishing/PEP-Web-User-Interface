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
