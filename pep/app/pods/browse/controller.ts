import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { FREUD_GW_CODE, FREUD_SE_CODE, PEP_GLOSSARY_ID } from 'pep/constants/books';
import Book from 'pep/pods/book/model';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';
import { SortedBooks } from 'pep/utils/browse';

import { getFreudGWVolumes, getFreudSEVolumes } from '../../utils/browse';

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}

export default class Browse extends Controller {
    @service fastboot!: FastbootService;

    @tracked tab = BrowseTabs.JOURNALS;
    @tracked journals!: Journal[];
    @tracked books!: Book[];
    @tracked videos!: Video[];
    @tracked filter = '';

    tabs = BrowseTabs;

    /**
     * Parse the GW document to get the volumes with their titles
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get gwVolumes() {
        return getFreudGWVolumes(this.model.gw.document);
    }

    /**
     * Parse the SE document to get the volumes with their titles
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get seVolumes() {
        return getFreudSEVolumes(this.model.se.document);
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
                    if (book.bookCode === FREUD_GW_CODE) {
                        books.freudsCollectedWorks.GW.books.push(book);
                    } else if (book.bookCode === FREUD_SE_CODE) {
                        books.freudsCollectedWorks.SE.books.push(book);
                    } else if (book.id !== PEP_GLOSSARY_ID) {
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
                others: []
            }
        );
        books.freudsCollectedWorks.GW.title = `${books.freudsCollectedWorks.GW?.books[0]?.authors} ${books.freudsCollectedWorks.GW?.books[0]?.title}`;
        books.freudsCollectedWorks.GW.volumes = this.gwVolumes ?? [];
        books.freudsCollectedWorks.SE.title = `${books.freudsCollectedWorks.SE?.books[0]?.authors} ${books.freudsCollectedWorks.SE?.books[0]?.title}`;
        books.freudsCollectedWorks.SE.volumes = this.seVolumes ?? [];
        books.others = books.others.sortBy('authors');
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
