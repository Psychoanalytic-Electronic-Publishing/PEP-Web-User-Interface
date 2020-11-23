import Book from 'pep/pods/book/model';
import Document from 'pep/pods/document/model';
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

export function getFreudSEVolumes(document: string) {
    const volumes = getVolumesFromFreudDocument(document);
    volumes.splice(0, 2);
    return volumes;
}

export function getFreudGWVolumes(document: string) {
    const volumes = getVolumesFromFreudDocument(document);
    volumes.shift();
    return volumes;
}

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
