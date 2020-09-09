import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import SessionService from 'ember-simple-auth/services/session';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';
import copy from 'lodash.clonedeep';

import {
    SEARCH_TYPE_EVERYWHERE,
    SearchTermValue,
    ViewPeriod,
    SEARCH_DEFAULT_VIEW_PERIOD,
    SEARCH_DEFAULT_TERMS
} from 'pep/constants/search';
import AjaxService from 'pep/services/ajax';
import LoadingBarService from 'pep/services/loading-bar';
import Modal from '@gavant/ember-modals/services/modal';
import ENV from 'pep/config/environment';
import { ServerStatus } from 'pep/api';

export default class Application extends Controller {
    @service loadingBar!: LoadingBarService;
    @service session!: SessionService;
    @service ajax!: AjaxService;
    @service notifications!: NotificationService;
    @service modal!: Modal;
    @service intl!: IntlService;

    @tracked isLimitOpen: boolean = false;
    @tracked smartSearchTerm: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = ViewPeriod.PAST_WEEK;
    // create a copy of the default search terms objects so they can be mutated
    @tracked searchTerms: SearchTermValue[] = copy(SEARCH_DEFAULT_TERMS);

    /**
     * Submits the application/nav sidebar's search form and transitions the
     * user to the search results page to fetch and display the results
     */
    @action
    submitSearch() {
        const searchTerms = this.searchTerms.filter((t) => !!t.term);

        const queryParams = {
            q: this.smartSearchTerm,
            matchSynonyms: this.matchSynonyms,
            citedCount: this.citedCount,
            viewedCount: this.viewedCount,
            viewedPeriod: this.viewedPeriod,
            //json stringify is workaround for bug w/array-based query param values
            //@see https://github.com/emberjs/ember.js/issues/18981
            searchTerms: !isEmpty(searchTerms) ? JSON.stringify(searchTerms) : null,
            facets: []
        };

        return this.transitionToRoute('search', { queryParams });
    }

    /**
     * Clears/resets the application/nav sidebar's search form
     */
    @action
    clearSearch() {
        this.smartSearchTerm = '';
        this.matchSynonyms = false;
        this.citedCount = '';
        this.viewedCount = '';
        this.viewedPeriod = ViewPeriod.PAST_WEEK;
        this.isLimitOpen = false;
        // create a copy of the default search terms objects so they can be mutated
        this.searchTerms = copy(SEARCH_DEFAULT_TERMS);
    }

    /**
     * Adds a new blank search term value field
     * @param {SearchTermValue} newSearchTerm
     */
    @action
    addSearchTerm(newSearchTerm: SearchTermValue) {
        this.searchTerms = this.searchTerms.concat([newSearchTerm]);
    }

    /**
     * Removes a search term value field
     * @param {SearchTermValue} removedSearchTerm
     */
    @action
    removeSearchTerm(removedSearchTerm: SearchTermValue) {
        const searchTerms = this.searchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.searchTerms = searchTerms;
    }

    /**
     * Updates a search term field's value
     * @param {SearchTermValue} oldTerm
     * @param {SearchTermValue} newTerm
     */
    @action
    updateSearchTerm(oldTerm: SearchTermValue, newTerm: SearchTermValue) {
        const searchTerms = this.searchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.searchTerms = searchTerms;
    }

    /**
     * Update search match synonyms checkbox
     * @param {Boolean} isChecked
     */
    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.matchSynonyms = isChecked;
    }

    /**
     * Update the search view period
     * @param {ViewPeriod} value
     */
    @action
    updateViewedPeriod(value: ViewPeriod) {
        this.viewedPeriod = value;
    }

    /**
     * Clears the cited/viewed fields when the limit section is collapsed
     * @param {boolean} isOpen
     */
    @action
    toggleLimitFields(isOpen: boolean) {
        this.isLimitOpen = isOpen;
        if (!this.isLimitOpen) {
            this.citedCount = '';
            this.viewedCount = '';
            this.viewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
        }
    }

    /**
     * Open the about modal dialog
     *
     * @returns Promise<Void>
     * @memberof PageDrawer
     */
    @action
    async openAboutModal() {
        try {
            this.loadingBar.show();
            const status = await this.ajax.request<ServerStatus>('Session/Status');
            return this.modal.open('user/about', {
                serverInformation: status,
                clientBuildVersion: ENV.buildVersion
            });
        } catch (error) {
            this.notifications.error(this.intl.t('serverErrors.unknown.unexpected'));
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        application: Application;
    }
}
