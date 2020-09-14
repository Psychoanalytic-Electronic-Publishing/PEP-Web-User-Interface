import Component from '@glimmer/component';
import { action, computed, setProperties } from '@ember/object';
import { later, next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import {
    SEARCH_TYPE_EVERYWHERE,
    SearchTermValue,
    VIEW_PERIODS,
    ViewPeriod,
    SearchTermId,
    SEARCH_TYPES
} from 'pep/constants/search';
import ScrollableService from 'pep/services/scrollable';
import ConfigurationService from 'pep/services/configuration';
import { fadeTransition } from 'pep/utils/animation';

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
    onLimitTextChange?: (value: string | undefined) => void;
    toggleLimitFields?: (isOpen: boolean) => void;
}

export default class SearchForm extends Component<SearchFormArgs> {
    @service scrollable!: ScrollableService;
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;

    animateTransition = fadeTransition;
    animateDuration = 300;

    get viewPeriodOptions() {
        return VIEW_PERIODS.map((period) => ({
            ...period,
            label: this.intl.t(period.label)
        }));
    }

    @computed('args.{smartSearchTerm,searchTerms.@each.term}')
    get hasEnteredSearch() {
        return (
            this.args.smartSearchTerm ||
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
        return (
            this.args.resultsCount && this.args.resultsCount > this.configuration.base.search.tooManyResults.threshold
        );
    }

    /**
     * Add a new search term field
     */
    @action
    addSearchTerm() {
        if (this.canAddSearchTerm) {
            this.args.addSearchTerm({
                type: SEARCH_TYPE_EVERYWHERE.id,
                term: ''
            });
            later(() => this.scrollable.recalculate('sidebar-left'), this.animateDuration);
        }
    }

    /**
     * Remove a search term field
     */
    @action
    removeSearchTerm(searchTerm: SearchTermValue) {
        this.args.removeSearchTerm(searchTerm);
        later(() => this.scrollable.recalculate('sidebar-left'), this.animateDuration);
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
