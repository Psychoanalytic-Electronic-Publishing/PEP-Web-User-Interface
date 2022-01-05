import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import IntlService from 'ember-intl/services/intl';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PossiblePeriodValues, PossiblePubPeriodValues, PUBPERIOD_ALL_YEARS, PUBPERIODS } from 'pep/constants/sidebar';
import { QueryParams } from 'pep/hooks/useQueryParams';
import Document from 'pep/pods/document/model';
import Journal from 'pep/pods/journal/model';
import ConfigurationService from 'pep/services/configuration';
import FastbootMediaService from 'pep/services/fastboot-media';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import ScrollableService from 'pep/services/scrollable';
import SidebarService from 'pep/services/sidebar';
import { documentCSVUrl } from 'pep/utils/url';

export default class MostViewed extends Controller {
    @service declare loadingBar: LoadingBarService;
    @service declare fastbootMedia: FastbootMediaService;
    @service declare sidebar: SidebarService;
    @service declare intl: IntlService;
    @service declare configuration: ConfigurationService;
    @service declare scrollable: ScrollableService;
    @service('pep-session') declare session: PepSessionService;

    queryParams = ['author', 'title', 'sourcename', 'pubperiod', 'citeperiod'];
    @tracked searchQueryParams!: QueryParams;
    @tracked paginator!: Pagination<Document>;
    @tracked author = '';
    @tracked title = '';
    @tracked journal?: Journal;
    @tracked pubperiod: PossiblePubPeriodValues = PUBPERIOD_ALL_YEARS.value;
    @tracked citeperiod?: PossiblePeriodValues;
    queryType = 'MostViewed';

    /**
     * GET/SET for sourcename. Ember requires the set if we are using it as a query param.
     * Eventually we should use journal IDS to search on instead of the title so that way we can
     * reload them if coming from a pasted link
     *
     * @memberof MostViewed
     */
    @computed('journal.title')
    get sourcename() {
        return this.journal?.title ?? '';
    }
    set sourcename(value: string) {
        console.log(value);
    }

    get periods() {
        return PUBPERIODS.map((item) => {
            return {
                label: this.intl.t(item.translationKey),
                value: item.value
            };
        });
    }

    get tableSorts() {
        const citePeriod = this.citeperiod;
        if (citePeriod) {
            return [
                {
                    isAscending: false,
                    valuePath: `stat.art_views_${citePeriod}`
                }
            ];
        }
        return [];
    }

    /**
     * Transform the sorting to a format the API can handle
     *
     * @param {string[]} sorts
     * @returns
     * @memberof Search
     */
    @action
    async onChangeSorting(sorts: string[]) {
        if (sorts?.length) {
            const sort = sorts[0];
            const splitSort = sort.split('_');
            const newCitePeriod = splitSort[splitSort.length - 1] as PossiblePeriodValues;
            if (newCitePeriod === this.citeperiod) {
                this.citeperiod = undefined;
                return [];
            } else {
                this.citeperiod = newCitePeriod;
                return [this.citeperiod];
            }
        } else {
            return [];
        }
    }

    /**
     * Filter table results based on query params
     *
     * @returns Document[]
     * @memberof MostCited
     */
    @action
    async filterTableResults() {
        try {
            this.searchQueryParams.update();
            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            this.loadingBar.show();
            const results = await this.paginator.filterModels();
            this.scrollable.scrollToTop('page-content');
            this.loadingBar.hide();
            return results;
        } catch (err) {
            this.loadingBar.hide();
            throw err;
        }
    }

    /**
     * Clears/resets the filters form
     */
    @action
    resetForm() {
        this.searchQueryParams.author = '';
        this.searchQueryParams.title = '';
        this.searchQueryParams.journal = undefined;
        this.paginator.clearModels();
    }

    /**
     * Sets the period value after its changed
     *
     * @param {PossiblePeriodValues} period
     * @memberof MostCited
     */
    @action
    updatePeriod(period: PossiblePeriodValues) {
        this.searchQueryParams.pubperiod = period;
    }

    /**
     * Update the journal
     *
     * @param {Journal} journal
     * @memberof MostViewed
     */
    @action
    updateJournal(journal: Journal) {
        this.searchQueryParams.journal = journal;
    }

    /**
     * Download CSV
     *
     * @memberof MostViewed
     */
    @action
    downloadCSV() {
        const queryParams = buildQueryParams({
            context: this,
            pagingRootKey: null,
            filterRootKey: null,
            filterList: ['author', 'title', 'sourcename', 'pubperiod', 'queryType'],
            processQueryParams: (params) => {
                if (params.pubperiod === PUBPERIOD_ALL_YEARS.value) {
                    delete params.pubperiod;
                }
                return params;
            }
        });
        delete queryParams.limit;
        window.location.href = documentCSVUrl(this.store, queryParams, this.session);
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'most-viewed': MostViewed;
    }
}
