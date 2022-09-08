import { action, computed, setProperties } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import IntlService from 'ember-intl/services/intl';

import { SEARCH_TYPES, SearchTermId, SearchTermValue, VIEW_PERIODS, ViewPeriod } from 'pep/constants/search';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';
import { BaseGlimmerSignature } from 'pep/utils/types';

import { SEARCH_TYPE_ARTICLE } from '../../../../constants/search';

interface SearchFormArgs {
    resultsCount?: number;
    smartSearchTerm?: string;
    searchTerms?: SearchTermValue[];
    citedCount?: string;
    viewedCount?: string;
    viewedPeriod?: number;
    isLimitOpen?: boolean;
    updateSmartSearchText: (text: string) => void;
    addSearchTerm: (term: SearchTermValue) => void;
    removeSearchTerm: (term: SearchTermValue) => void;
    updateSearchTerm: (oldTerm: SearchTermValue, newTerm: SearchTermValue) => void;
    updateViewedPeriod: (value: ViewPeriod) => void;
    onSearchTermTextChange?: (term: SearchTermValue) => void;
    onLimitTextChange?: (value?: string) => void;
    toggleLimitFields?: (isOpen: boolean) => void;
    resetForm: () => void;
}

export default class SearchForm extends Component<BaseGlimmerSignature<SearchFormArgs>> {
    @service scrollable!: ScrollableService;
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;

    animateTransition = fadeTransition;
    animateDuration = 300;

    get viewPeriodOptions() {
        return VIEW_PERIODS.map((period) => ({
            ...period,
            label: this.intl.t(period.label)
        }));
    }

    @computed('args.{smartSearchTerm,citedCount,viewedCount,searchTerms.@each.term}')
    get hasEnteredSearch() {
        return !!(
            this.args.smartSearchTerm ||
            this.args.citedCount ||
            this.args.viewedCount ||
            (Array.isArray(this.args.searchTerms) && this.args.searchTerms.filter((t) => !!t.term).length > 0)
        );
    }

    get searchTypeOptions() {
        return SEARCH_TYPES.filter((t) => t.isTypeOption);
    }

    get canAddSearchTerm() {
        return (this.args.searchTerms?.length ?? 0) < this.searchTypeOptions.length;
    }

    get hasTooManyResults() {
        const resultCount = this.args.resultsCount;
        if (resultCount) {
            return resultCount > this.configuration.base.search.tooManyResults.threshold;
        } else {
            return false;
        }
    }

    /**
     * Sets up an auth succeeded event listener to update the search form using
     * the logged in user's preferences
     * @param {unknown} owner
     * @param {SearchFormArgs} args
     */
    constructor(owner: unknown, args: SearchFormArgs) {
        super(owner, args);
        this.session.on('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * Removes the auth succeeded event listener on component destroy
     */
    willDestroy() {
        super.willDestroy();
        this.session.off('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * When the user is logged in, update the search form using their current preferences
     * (since the current values are created/detached on route enter) but ONLY if the user
     * does not have the search form already populated
     */
    @action
    onAuthenticationSucceeded() {
        if (!this.hasEnteredSearch) {
            this.args.resetForm();
        }
    }

    /**
     * Add a new search term field
     */
    @action
    addSearchTerm() {
        if (this.canAddSearchTerm) {
            this.args.addSearchTerm({
                type: SEARCH_TYPE_ARTICLE.id,
                term: ''
            });
        }
    }

    /**
     * Remove a search term field
     */
    @action
    removeSearchTerm(searchTerm: SearchTermValue) {
        this.args.removeSearchTerm(searchTerm);
    }

    /**
     * Update a search term's type
     * @param {SearchTermValue} oldTerm
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     */
    @action
    updateTermType(oldTerm: SearchTermValue, event: HTMLElementEvent<HTMLSelectElement>) {
        const type = event.target.value as SearchTermId;
        const newTerm = { ...oldTerm, type };
        this.args.updateSearchTerm(oldTerm, newTerm);
    }

    /**
     * Update a search term's text
     * @param {SearchTermValue} oldTerm
     * @param {string} newText
     */
    @action
    updateTermText(oldTerm: SearchTermValue, term: string) {
        setProperties(oldTerm, { term });
        this.onTermTextChange(oldTerm);
    }

    /**
     * Run an action when search term text values change
     * @param {SearchTermValue} searchTerm
     * @param {HTMLInputElement} event
     */
    @action
    onTermTextChange(searchTerm: SearchTermValue) {
        // execute action in the next runloop, so it has the new value
        next(this, () => this.args.onSearchTermTextChange?.(searchTerm));
    }

    /**
     * Run an action when the smart search text value changes
     * @param {HTMLInputElement} event
     */
    @action
    onLimitTextChange(event: HTMLElementEvent<HTMLInputElement>) {
        // execute action in the next runloop, so it has the new value
        next(this, () => this.args.onLimitTextChange?.(event.target.value));
    }

    /**
     * Update the view period
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     */
    @action
    onViewedPeriodChange(event: HTMLElementEvent<HTMLSelectElement>) {
        const period = Number(event.target.value) as ViewPeriod;
        this.args.updateViewedPeriod(period);
    }

    /**
     * Toggles the display of the limit fields
     */
    @action
    toggleLimitFields() {
        this.args.toggleLimitFields?.(!this.args.isLimitOpen);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Search::Form': typeof SearchForm;
    }
}
