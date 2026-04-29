import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import RouterService from '@ember/routing/router-service';

import { BOOK_COLLECTIONS, PEP_GLOSSARY_ID } from 'pep/constants/books';
import Book from 'pep/pods/book/model';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';

export interface FilteredBookCollection {
    books: Book[];
    bookCode: string;
    fallbackTitle: string;
    route: string;
    sidebarSectionHeadingTranslationKey: string;
    title: string;
}

export interface FilteredBookCollectionSection {
    headingTranslationKey: string;
    collections: FilteredBookCollection[];
}

export interface FilteredBooks {
    collectedWorks: FilteredBookCollection[];
    others: Book[];
}

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}

export default class Browse extends Controller {
    @service fastboot!: FastbootService;
    @service router!: RouterService; // Inject the router service

    @tracked tab = BrowseTabs.JOURNALS;
    @tracked journals!: Journal[];
    @tracked books!: Book[];
    @tracked videos!: Video[];
    @tracked filter = '';

    tabs = BrowseTabs;

    constructor() {
        super(...arguments);
        this.router.on('routeDidChange', this.setTabFromRoute.bind(this));
    }

    setTabFromRoute() {
        const currentURL = this.router.currentURL;

        if (currentURL === '/browse/previews') {
            this.changeTab(BrowseTabs.BOOKS);
        }
    }

    /**
     * Filter books into configured collected-works groups and "others".
     *
     * @readonly
     * @memberof Browse
     */
    @cached
    get filteredBooks(): FilteredBooks {
        const filter = this.filter.trim().toLowerCase();
        const collectedWorksByCode = BOOK_COLLECTIONS.reduce<Record<string, FilteredBookCollection>>((memo, item) => {
            memo[item.bookCode] = {
                books: [],
                bookCode: item.bookCode,
                fallbackTitle: item.bookCode,
                route: `browse.book.${item.routeSegment}`,
                sidebarSectionHeadingTranslationKey: item.sidebarSectionHeadingTranslationKey,
                title: ''
            };
            return memo;
        }, {});
        const others = this.books.reduce<Book[]>((memo, book) => {
            if (filter && !book.displayTitle.toLowerCase().includes(filter)) {
                return memo;
            }
            const collection = collectedWorksByCode[book.bookCode];
            if (collection) {
                collection.books.push(book);
            } else if (book.id !== PEP_GLOSSARY_ID) {
                memo.push(book);
            }
            return memo;
        }, []);
        const collectedWorks = BOOK_COLLECTIONS.map((item) => {
            const collection = collectedWorksByCode[item.bookCode];
            collection.title = `${collection?.books[0]?.authors ?? ''} ${collection?.books[0]?.title ?? ''}`.trim();
            return collection;
        }).filter((item) => {
            if (!filter) {
                return true;
            }
            const label = item.title || item.fallbackTitle;
            return item.books.length > 0 || label.toLowerCase().includes(filter);
        });

        return {
            collectedWorks,
            others: others.sortBy('authors')
        };
    }

    get filteredCollectedBookCount() {
        return this.filteredBooks.collectedWorks.reduce((total, item) => {
            return total + item.books.length;
        }, 0);
    }

    get filteredCollectedWorkSections(): FilteredBookCollectionSection[] {
        const sections = this.filteredBooks.collectedWorks.reduce<FilteredBookCollectionSection[]>((memo, item) => {
            const existing = memo.find((section) => section.headingTranslationKey === item.sidebarSectionHeadingTranslationKey);
            if (existing) {
                existing.collections.push(item);
            } else {
                memo.push({
                    headingTranslationKey: item.sidebarSectionHeadingTranslationKey,
                    collections: [item]
                });
            }
            return memo;
        }, []);
        return sections;
    }

    /**
     * Because books are special, we have to calculate the number of filtered results
     *
     * @readonly
     * @memberof Browse
     */
    get filteredBookCounts() {
        return this.filteredBooks.others.length + this.filteredCollectedBookCount;
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
            : this.videos.filter((item) => item.displayTitle.toLowerCase().includes(this.filter.toLowerCase()));
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
