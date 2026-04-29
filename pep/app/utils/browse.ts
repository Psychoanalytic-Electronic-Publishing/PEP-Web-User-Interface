import { parseXML } from 'pep/utils/dom';

export interface BookVolume {
    volume: string;
    title: string;
    id: string;
}

/**
 * Parse a collection volume document into [{ volume, title, id }]
 *
 * @param {string} document
 * @return {BookVolume[]}
 */
export function parseCollectionVolumes(document: string) {
    const xml = parseXML(document);
    if (!(xml instanceof Error)) {
        const volumeNodes = xml.getElementsByTagName('row');
        const volumes = Array.from(volumeNodes);
        return Array.from(volumes).map((item) => {
            const title = item.querySelector('entry')?.innerHTML;
            const pgx = item.querySelector('pgx');
            const volume = pgx?.innerHTML;
            const id = pgx?.getAttribute('rx');
            return {
                volume,
                title,
                id
            } as BookVolume;
        });
    } else {
        return [];
    }
}

/**
 * Parse collection volumes and drop top rows when the source document includes header rows.
 *
 * @param {string} document
 * @param {number} trimLeadingRows
 * @return {BookVolume[]}
 */
export function getCollectionVolumes(document: string, trimLeadingRows = 0) {
    const volumes = parseCollectionVolumes(document);
    if (trimLeadingRows <= 0) {
        return volumes;
    }
    return volumes.slice(trimLeadingRows);
}
