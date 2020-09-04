import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import { joinParamValues, buildSearchQueryParams } from 'pep/utils/search';
import { SEARCH_FACET_ART_ID, FacetId } from 'pep/constants/search';

interface PageSidebarWidgetsExpertPicksArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsExpertPicks extends Component<PageSidebarWidgetsExpertPicksArgs> {
    @service configuration!: ConfigurationService;
    @service ajax!: AjaxService;
    @service store!: DS.Store;
    @tracked isLoading = false;
    @tracked results: Document[] = [];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.EXPERT_PICKS;

    /**
     * Load the widget results data
     */
    @dontRunInFastboot
    async loadResults() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/
        const queryItems = this.configuration.base.home.expertPicks.map((item) => {
            return {
                id: FacetId.ART_ID,
                value: item.articleId
            };
        });
        const params = buildSearchQueryParams('', [], false, queryItems);
        try {
            this.isLoading = true;
            const results = await this.store.query('document', params);
            this.results = results.toArray();
            this.isLoading = false;
        } catch (err) {
            this.isLoading = false;
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    onElementInsert() {
        this.loadResults();
    }
}

// art_id:(IJP.076.0315A or AIM.062.0193A or PSC.055.0145A or REVAPA.002.0274A)
