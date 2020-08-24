import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import LoadingBarService from 'pep/services/loading-bar';
import FastbootMediaService from 'pep/services/fastboot-media';
import SidebarService from 'pep/services/sidebar';
import IntlService from 'ember-intl/services/intl';
import Journal from 'pep/pods/journal/model';

type PossiblePeriodValues = '5' | '10' | '20' | 'all';
type period = { label: string; value: PossiblePeriodValues };

export default class MostCited extends Controller {
    @service loadingBar!: LoadingBarService;
    @service fastbootMedia!: FastbootMediaService;
    @service sidebar!: SidebarService;
    @service intl!: IntlService;

    queryParams = ['author', 'title', 'sourcename', 'period'];

    @tracked paginator!: Pagination<Document>;
    @tracked author = '';
    @tracked title = '';
    @tracked journal?: Journal;
    @tracked period: PossiblePeriodValues = 'all';

    @computed('journal')
    get sourcename() {
        return this.journal?.title;
    }
    queryType = 'MostCited';

    periods: period[] = [
        { label: this.intl.t('mostCited.fiveYears'), value: '5' },
        { label: this.intl.t('mostCited.tenYears'), value: '10' },
        { label: this.intl.t('mostCited.twentyYears'), value: '20' },
        { label: this.intl.t('mostCited.allYears'), value: 'all' }
    ];

    /**
     * Filter table results based on query params
     *
     * @returns Document[]
     * @memberof MostCited
     */
    @action
    async filterTableResults() {
        try {
            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            this.loadingBar.show();
            const results = await this.paginator.filterModels();
            return results;
        } finally {
            this.loadingBar.hide();
        }
    }

    /**
     * Clears/resets the filters form
     */
    @action
    resetForm() {
        this.author = '';
        this.title = '';
        this.journal = undefined;
    }

    /**
     * Sets the period value after its changed
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof MostCited
     */
    @action
    updatePeriod(period: PossiblePeriodValues) {
        this.period = period;
    }

    @action
    updateJournal(journal: Journal) {
        this.journal = journal;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'most-cited': MostCited;
    }
}
