import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { tracked } from '@glimmer/tracking';
import ConfigurationService from 'pep/services/configuration';
import AjaxService from 'pep/services/ajax';
import DS from 'ember-data';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { SearchFacetId } from 'pep/constants/search';
import { buildSearchQueryParams } from 'pep/utils/search';
import Document from 'pep/pods/document/model';

interface PageSidebarWidgetsRelatedDocumentsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsRelatedDocuments extends Component<PageSidebarWidgetsRelatedDocumentsArgs> {
    @service configuration!: ConfigurationService;
    @service ajax!: AjaxService;
    @service store!: DS.Store;
    @tracked isLoading = false;
    @tracked results: Document[] = [];

    get data(): Document | undefined {
        return this.args.data[this.widget];
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.RELATED_DOCUMENTS;

    /**
     * Load the widget results data
     */
    @dontRunInFastboot
    async loadResults() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/

        const params = buildSearchQueryParams('', [], false, [
            {
                id: SearchFacetId.ART_QUAL,
                value: this.data?.relatedrx!
            }
        ]);
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
        if (this.data?.relatedrx) {
            this.loadResults();
        }
    }

    @action
    onElementChange() {
        if (this.data?.relatedrx) {
            this.loadResults();
        } else {
            this.results = [];
        }
    }
}
