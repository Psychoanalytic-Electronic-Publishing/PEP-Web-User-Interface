import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';

import Modal from '@gavant/ember-modals/services/modal';

import { ServerStatus } from 'pep/api';
import ENV from 'pep/config/environment';
import {
    CLEAR_SEARCH, ESCAPE, NAVIGATE_TO_BROWSE, NAVIGATE_TO_HOME, NAVIGATE_TO_SEARCH, TOGGLE_GLOSSARY_HIGHLIGHTING,
    TOGGLE_HIC, TOGGLE_LEFT_SIDEBAR, TOGGLE_RIGHT_SIDEBAR, TOGGLE_SIDEBARS
} from 'pep/constants/keyboard-shortcuts';
import { PreferenceKey } from 'pep/constants/preferences';
import { SEARCH_DEFAULT_VIEW_PERIOD, SEARCH_TYPE_ARTICLE, SearchTermValue, ViewPeriod } from 'pep/constants/search';
import { KeyboardShortcut } from 'pep/modifiers/register-keyboard-shortcuts';
import AjaxService from 'pep/services/ajax';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import { clearSearch } from 'pep/utils/search';

export default class Application extends Controller {
    @service loadingBar!: LoadingBarService;
    @service('pep-session') session!: PepSessionService;
    @service ajax!: AjaxService;
    @service notifications!: NotificationService;
    @service modal!: Modal;
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service sidebar!: SidebarService;

    @tracked isLimitOpen: boolean = false;
    @tracked smartSearchTerm: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = ViewPeriod.PAST_WEEK;
    @tracked searchTerms: SearchTermValue[] = [];
    openNotificationModal?: boolean = false;

    queryParams = ['openNotificationModal'];

    shortcuts: KeyboardShortcut[] = [
        {
            keys: NAVIGATE_TO_BROWSE,
            shortcut: () => {
                this.transitionToRoute('browse');
            }
        },
        {
            keys: NAVIGATE_TO_HOME,
            shortcut: () => {
                this.transitionToRoute('index');
            }
        },
        {
            keys: NAVIGATE_TO_SEARCH,
            shortcut: () => {
                this.transitionToRoute('search');
            }
        },
        {
            keys: CLEAR_SEARCH,
            shortcut: () => {
                this.clearSearch();
            }
        },
        {
            keys: TOGGLE_SIDEBARS,
            shortcut: () => {
                const areBothOpen = this.sidebar.leftSidebarIsOpen && this.sidebar.rightSidebarIsOpen;
                this.sidebar.toggleAll(areBothOpen ? false : true);
            }
        },
        {
            keys: TOGGLE_LEFT_SIDEBAR,
            shortcut: () => {
                this.sidebar.toggleLeftSidebar(!this.sidebar.leftSidebarIsOpen);
            }
        },
        {
            keys: TOGGLE_RIGHT_SIDEBAR,
            shortcut: () => {
                this.sidebar.toggleRightSidebar(!this.sidebar.rightSidebarIsOpen);
            }
        },
        {
            keys: TOGGLE_GLOSSARY_HIGHLIGHTING,
            shortcut: () => {
                if (this.currentUser.preferences) {
                    const currentValue = this.currentUser.preferences?.glossaryFormattingEnabled;
                    this.currentUser.updatePrefs({ [PreferenceKey.GLOSSARY_FORMATTING_ENABLED]: !currentValue });
                }
            }
        },
        {
            keys: TOGGLE_HIC,
            shortcut: () => {
                if (this.currentUser.preferences) {
                    const currentValue = this.currentUser.preferences?.searchHICEnabled;
                    this.currentUser.updatePrefs({ [PreferenceKey.SEARCH_HIC_ENABLED]: !currentValue });
                }
            }
        },
        {
            keys: ESCAPE,
            shortcut: () => {
                const active = document.activeElement;
                const enteringText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active?.tagName ?? '');
                if (enteringText) {
                    (active as HTMLInputElement)?.blur();
                }
            },
            options: {
                allowInInput: true
            }
        }
    ];

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
        clearSearch(this, this.configuration, this.currentUser);
    }

    /**
     * Adds a new blank search term value field
     * @param {SearchTermValue} newSearchTerm
     */
    @action
    addSearchTerm(newSearchTerm: SearchTermValue) {
        this.searchTerms = this.searchTerms.concat([newSearchTerm]);
        taskFor(this.updateSearchFormPrefs).perform();
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
            searchTerms.pushObject({ type: SEARCH_TYPE_ARTICLE.id, term: '' });
        }

        this.searchTerms = searchTerms;
        taskFor(this.updateSearchFormPrefs).perform();
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
        taskFor(this.updateSearchFormPrefs).perform();
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

        taskFor(this.updateSearchFormPrefs).perform();
    }

    /**
     * Updates the user's search form preferences after a short delay
     */
    @restartableTask
    *updateSearchFormPrefs() {
        yield timeout(500);
        yield this.currentUser.updatePrefs({
            [PreferenceKey.SEARCH_LIMIT_IS_SHOWN]: this.isLimitOpen,
            [PreferenceKey.SEARCH_TERM_FIELDS]: this.searchTerms.map((t) => t.type)
        });
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
