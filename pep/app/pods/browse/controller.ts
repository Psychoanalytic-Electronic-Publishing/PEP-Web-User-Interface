import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import Book from 'pep/pods/book/model';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}
export default class Browse extends Controller {
    @tracked tab = BrowseTabs.JOURNALS;
    @tracked journals!: Journal[];
    @tracked books!: Book[];
    @tracked videos!: Video[];
    @tracked filter = '';

    tabs = BrowseTabs;

    get filteredBooks() {
        const filter = this.filter;
        const books = this.books.reduce<{
            freudsCollectedWorks: { GW: Book[]; SE: Book[] };
            glossaries: Book[];
            others: Book[];
        }>(
            (books, book) => {
                if (!filter || book.title.toLowerCase().includes(filter.toLowerCase())) {
                    if (book.documentId === 'ZBK.069.0000A' || book.documentId === 'IPL.094.0001A') {
                        books.glossaries.push(book);
                    } else if (book.bookCode === 'GW') {
                        books.freudsCollectedWorks.GW.push(book);
                    } else if (book.bookCode === 'SE') {
                        books.freudsCollectedWorks.SE.push(book);
                    } else {
                        books.others.push(book);
                    }
                }
                return books;
            },
            {
                freudsCollectedWorks: {
                    GW: [],
                    SE: []
                },
                glossaries: [],
                others: []
            }
        );
        books.freudsCollectedWorks.GW.sortBy('id');
        return books;
    }

    get filteredBookCounts() {
        return (
            this.filteredBooks.others.length +
            this.filteredBooks.glossaries.length +
            this.filteredBooks.freudsCollectedWorks.GW.length +
            this.filteredBooks.freudsCollectedWorks.SE.length
        );
    }

    get firstGWBook() {
        return this.filteredBooks.freudsCollectedWorks.GW[0];
    }

    get filteredJournals() {
        return !this.filter
            ? this.journals
            : this.journals.filter((item) => item.title.toLowerCase().includes(this.filter.toLowerCase()));
    }

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
    async changeTab(tab: BrowseTabs) {
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
