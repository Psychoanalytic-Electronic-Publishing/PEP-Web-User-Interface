import Book from 'pep/pods/book/model';
import { parseXML } from 'pep/utils/dom';

export interface FreudVolume {
    volume: string;
    title: string;
    id: string;
}

export interface SortedBooks {
    freudsCollectedWorks: {
        GW: {
            title: string;
            books: Book[];
            volumes: FreudVolume[];
        };
        SE: {
            title: string;
            books: Book[];
            volumes: FreudVolume[];
        };
    };
    glossaries: Book[];
    others: Book[];
}

/**
 * Get volume information from the SE document
 *
 * @export
 * @param {string} document
 * @return {FreudVolume[]}
 */
export function getFreudSEVolumes(document: string) {
    const volumes = getVolumesFromFreudDocument(document);
    volumes.splice(0, 2);
    return volumes;
}

/**
 * Get volume information from the GW document
 *
 * @export
 * @param {string} document
 * @return {FreudVolume[]}
 */
export function getFreudGWVolumes(document: string) {
    const volumes = getVolumesFromFreudDocument(document);
    volumes.shift();
    return volumes;
}

/**
 * Get volumes from a freud document (of which there are two SE or GW). This is the method that does the heavy lifting and parsing of the doc
 *
 * @export
 * @param {string} document
 * @return {FreudVolume[]}
 */
export function getVolumesFromFreudDocument(document: string) {
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
            } as FreudVolume;
        });
    } else {
        return [];
    }
}
