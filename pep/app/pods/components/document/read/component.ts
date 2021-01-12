import { action, set } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import ENV from 'pep/config/environment';
import { DOCUMENT_EPUB_BASE_URL, DOCUMENT_PDF_BASE_URL, DOCUMENT_PDFORIG_BASE_URL } from 'pep/constants/documents';
import { PreferenceKey } from 'pep/constants/preferences';
import { TITLE_REGEX } from 'pep/constants/regex';
import { SEARCH_DEFAULT_VIEW_PERIOD, SearchViews, SearchViewType, ViewPeriod } from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import { SearchReadParams } from 'pep/pods/search/read/route';
import AjaxService from 'pep/services/ajax';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import PrinterService from 'pep/services/printer';
import SearchSelection from 'pep/services/search-selection';
import { buildSearchQueryParams, clearSearch } from 'pep/utils/search';
import { SearchSorts, SearchSortType, transformSearchSortsToTable, transformSearchSortToAPI } from 'pep/utils/sort';
import { serializeQueryParams } from 'pep/utils/url';
import { reject, resolve } from 'rsvp';

interface DocumentReadArgs {
    model: Document;
    page: number;
    searchQueryParams?: SearchReadParams;
    searchHitNumber?: number;
    onAuthenticated: () => void;
}

export default class DocumentRead extends Component<DocumentReadArgs> {
    @service modal!: ModalService;
    @service router!: RouterService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service auth!: AuthService;
    @service loadingBar!: LoadingBarService;
    @service store!: DS.Store;

    /**
     * Opens the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true, {
            actions: {
                onAuthenticated: this.args.onAuthenticated
            }
        });
    }

    /**
     * Clear the old search and then go to the search page using the new search terms
     *
     * @param {string} searchTerms
     * @memberof ReadDocument
     */
    @action
    viewSearch(searchTerms: string) {
        // TODO improve this typing
        clearSearch(this as any, this.configuration, this.currentUser);
        this.router.transitionTo('search', {
            queryParams: {
                ...this.configuration.defaultSearchParams,
                searchTerms
            }
        });
    }

    /**
     * Open the glossary modal to view the term
     *
     * @param {string} term
     * @param {GlossaryTerm} results
     * @memberof ReadDocument
     */
    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm) {
        this.modal.open('glossary', {
            results,
            term
        });
    }
}
