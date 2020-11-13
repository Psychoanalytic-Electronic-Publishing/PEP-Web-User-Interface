import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { FREUD_GW_CODE, FREUD_SE_CODE, IPL_GLOSSARY_ID, PEP_GLOSSARY_ID } from 'pep/constants/books';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Book from 'pep/pods/book/model';
import Document from 'pep/pods/document/model';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';
import { loadXSLT, parseXML } from 'pep/utils/dom';

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}

interface FreudVolume {
    volume: string;
    title: string;
    id: string;
}

interface SortedBooks {
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
export default class Browse extends Controller {
    @service fastboot!: FastbootService;

    @tracked tab = BrowseTabs.JOURNALS;
    @tracked journals!: Journal[];
    @tracked books!: Book[];
    @tracked videos!: Video[];
    @tracked gw!: Document;
    @tracked se!: Document;
    @tracked filter = '';
    @tracked xslt: Promise<globalThis.Document | null> = this.loadXSLT();

    @dontRunInFastboot
    loadXSLT() {
        return loadXSLT();
    }

    tabs = BrowseTabs;

    /**
     * Parse the GW document to get the volumes with their titles
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get gwVolumes() {
        const xml = parseXML(this.gw.document);
        if (!(xml instanceof Error)) {
            const volumeNodes = xml.getElementsByTagName('row');
            const volumes = Array.from(volumeNodes);
            volumes.shift();
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
        }
    }

    /**
     * Parse the SE document to get the volumes with their titles
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get seVolumes() {
        const xml = parseXML(this.se.document);
        if (!(xml instanceof Error)) {
            const volumeNodes = xml.getElementsByTagName('row');
            const volumes = Array.from(volumeNodes);
            volumes.splice(0, 2);
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
        }
    }

    /**
     * Filtered Books - Takes the all the books, and separates them by if the are freud (GW or SE book code),
     * as well as if the have specific document ID's (glossary items)
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get filteredBooks() {
        const filter = this.filter;
        const books = this.books.reduce<SortedBooks>(
            (books, book) => {
                if (!filter || book.title.toLowerCase().includes(filter.toLowerCase())) {
                    if (book.documentID === PEP_GLOSSARY_ID || book.documentID === IPL_GLOSSARY_ID) {
                        books.glossaries.push(book);
                    } else if (book.bookCode === FREUD_GW_CODE) {
                        books.freudsCollectedWorks.GW.books.push(book);
                    } else if (book.bookCode === FREUD_SE_CODE) {
                        books.freudsCollectedWorks.SE.books.push(book);
                    } else {
                        books.others.push(book);
                    }
                }
                return books;
            },
            {
                freudsCollectedWorks: {
                    GW: {
                        title: '',
                        books: [],
                        volumes: []
                    },
                    SE: {
                        title: '',
                        books: [],
                        volumes: []
                    }
                },
                glossaries: [],
                others: []
            }
        );
        books.freudsCollectedWorks.GW.title = `${books.freudsCollectedWorks.GW?.books[0]?.authors} ${books.freudsCollectedWorks.GW?.books[0]?.title}`;
        books.freudsCollectedWorks.GW.volumes = this.gwVolumes ?? [];
        books.freudsCollectedWorks.SE.title = `${books.freudsCollectedWorks.SE?.books[0]?.authors} ${books.freudsCollectedWorks.SE?.books[0]?.title}`;
        books.freudsCollectedWorks.SE.volumes = this.seVolumes ?? [];
        return books;
    }

    /**
     * Because books are special, we have to calculate the number of filtered results
     *
     * @readonly
     * @memberof Browse
     */
    get filteredBookCounts() {
        return (
            this.filteredBooks.others.length +
            this.filteredBooks.glossaries.length +
            this.filteredBooks.freudsCollectedWorks.GW.books.length +
            this.filteredBooks.freudsCollectedWorks.SE.books.length
        );
    }

    /**
     * Filtered journals by filter string input
     *
     * @readonly
     * @memberof Browse
     */
    get filteredJournals() {
        return !this.filter
            ? this.journals
            : this.journals.filter((item) => item.title.toLowerCase().includes(this.filter.toLowerCase()));
    }

    /**
     * Filtered videos by filter string input
     *
     * @readonly
     * @memberof Browse
     */
    get filteredVideos() {
        return !this.filter
            ? this.videos
            : this.videos.filter((item) => item.title.toLowerCase().includes(this.filter.toLowerCase()));
    }

    /**
     * Updated the tab when changed
     *
     * @param {BrowseTabs} tab
     * @memberof Browse
     */
    @action
    changeTab(tab: BrowseTabs) {
        this.tab = tab;
    }

    /**
     * Update the filter
     *
     * @param {string} term
     * @memberof Browse
     */
    @action
    onFilter(term: string) {
        this.filter = term;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        browse: Browse;
    }
}
