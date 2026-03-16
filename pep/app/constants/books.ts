export const PEP_GLOSSARY_ID = 'ZBK.069.0000A';
export const IJP_OPEN_CODE = 'IJPOPEN';

export interface BookCollectionConfig {
    altTranslationKey: string;
    bookCode: string;
    routeSegment: string;
    sidebarSectionHeadingTranslationKey: string;
    trimLeadingRows: number;
    volumeDocumentId: string;
    volumeHeadingTranslationKey: string;
}

export const BOOK_COLLECTIONS: readonly BookCollectionConfig[] = [
    {
        altTranslationKey: 'alt.gw',
        bookCode: 'GW',
        routeSegment: 'gw',
        sidebarSectionHeadingTranslationKey: 'browse.selection.books.freud',
        trimLeadingRows: 1,
        volumeDocumentId: 'GW.000.0000A',
        volumeHeadingTranslationKey: 'browse.gw.volumes'
    },
    {
        altTranslationKey: 'alt.se',
        bookCode: 'SE',
        routeSegment: 'se',
        sidebarSectionHeadingTranslationKey: 'browse.selection.books.freud',
        trimLeadingRows: 2,
        volumeDocumentId: 'SE.000.0000A',
        volumeHeadingTranslationKey: 'browse.se.volumes'
    },
    {
        altTranslationKey: 'alt.cwb',
        bookCode: 'CWB',
        routeSegment: 'cwb',
        sidebarSectionHeadingTranslationKey: 'browse.selection.books.bion',
        trimLeadingRows: 1,
        volumeDocumentId: 'CWB.000.0000A',
        volumeHeadingTranslationKey: 'browse.cwb.volumes'
    }
];

export const BOOK_COLLECTIONS_BY_ROUTE_SEGMENT = BOOK_COLLECTIONS.reduce<Record<string, BookCollectionConfig>>(
    (memo, item) => {
        memo[item.routeSegment] = item;
        return memo;
    },
    {}
);
