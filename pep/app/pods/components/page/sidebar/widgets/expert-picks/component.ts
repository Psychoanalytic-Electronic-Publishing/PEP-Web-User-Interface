import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchFacetId } from 'pep/constants/search';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

interface PageSidebarWidgetsExpertPicksArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsExpertPicks extends Component<PageSidebarWidgetsExpertPicksArgs> {
    @service configuration!: ConfigurationService;
    @service store!: DS.Store;
    @tracked results: Document[] = [];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.EXPERT_PICKS;

    /**
     * Load the widget results data
     */
    @restartableTask
    *loadResults() {
        const queryItems = this.configuration.base.home.expertPicks.map((item) => {
            return {
                id: SearchFacetId.ART_ID,
                value: item.articleId
            };
        });
        const params = buildSearchQueryParams('', [], false, queryItems);
        const results = yield this.store.query('document', params);
        this.results = results.toArray();
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        taskFor(this.loadResults).perform();
    }
}
