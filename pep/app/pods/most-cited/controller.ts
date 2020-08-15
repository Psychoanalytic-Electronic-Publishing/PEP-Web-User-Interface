import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import LoadingBarService from 'pep/services/loading-bar';
import FastbootMediaService from 'pep/services/fastboot-media';
import SidebarService from 'pep/services/sidebar';

type PossiblePeriodValues = 5 | 10 | 20 | 'all';
type period = { label: string; value: PossiblePeriodValues };

export default class MostCited extends Controller {
    @service loadingBar!: LoadingBarService;
    @service fastbootMedia!: FastbootMediaService;
    @service sidebar!: SidebarService;

    queryParams = ['author', 'title', 'sourcename', 'period'];

    @tracked paginator!: Pagination<Document>;
    @tracked author = '';
    @tracked title = '';
    @tracked sourcename = '';
    @tracked period: PossiblePeriodValues = 'all';
    queryType = 'MostCited';

    periods: period[] = [
        { label: '5 years', value: 5 },
        { label: '10 years', value: 10 },
        { label: '20 years', value: 20 },
        { label: 'All years', value: 'all' }
    ];

    @action
    async filterTableResults() {
        try {
            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            this.loadingBar.show();
            const results = await this.paginator.filterModels();
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
        this.author = '';
        this.title = '';
        this.sourcename = '';
    }

    @action
    updatePeriod(event: HTMLElementEvent<HTMLSelectElement>) {
        const value = event.target?.value;
        if (value === 'all') {
            this.period = value;
        } else {
            this.period = Number(value) as PossiblePeriodValues;
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'most-cited': MostCited;
    }
}
