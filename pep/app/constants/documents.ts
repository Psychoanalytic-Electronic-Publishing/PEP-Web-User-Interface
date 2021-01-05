import ENV from 'pep/config/environment';

export const DOCUMENT_IMG_BASE_URL = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Image`;
export const DOCUMENT_PDF_BASE_URL = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Downloads/PDF`;
export const DOCUMENT_PDFORIG_BASE_URL = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Downloads/PDFORIG`;
export const DOCUMENT_EPUB_BASE_URL = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Downloads/EPUB`;

/**
 *  The types of links in a document - these come from a type data attribute
 *
 * @export
 * @enum {number}
 */
export enum DocumentLinkTypes {
    GLOSSARY_TERM = 'TERM2',
    BIBLIOGRAPHY = 'BIBX',
    DOCUMENT = 'document-link',
    PAGE = 'pagelink',
    FIGURE = 'figure',
    TABLE_FIGURE = 'table-figure',
    FIGURE_WITH_ID = 'figure-id',
    AUTHOR_SEARCH = 'search-author',
    WEB = 'web-link',
    DOI = 'doi',
    SEARCH_HIT_ARROW = 'search-hit-arrow',
    SEARCH_HIT_TEXT = 'search-hit-text',
    BANNER = 'document-banner',
    TITLE = 'document-title',
    TRANSLATION = 'GroupIDTrans'
}
