import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { SearchFacetId } from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import { buildSearchQueryParams } from 'pep/utils/search';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsExpertPicksArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsExpertPicks extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsExpertPicksArgs>
> {
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

        const params = buildSearchQueryParams({
            facetValues: queryItems
        });
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
