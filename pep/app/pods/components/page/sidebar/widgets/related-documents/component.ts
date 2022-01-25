import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import DocumentSerializer from 'pep/pods/document/serializer';
import AjaxService from 'pep/services/ajax';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';

interface PageSidebarWidgetsRelatedDocumentsArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsRelatedDocuments extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsRelatedDocumentsArgs>
> {
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
    @restartableTask
    *loadResults(relatedrx: string) {
        const queryParms = serializeQueryParams({
            relatedToThis: relatedrx
        });
        const results = yield this.ajax.request(`/Database/RelatedToThis?${queryParms}`);
        const serializer = this.store.serializerFor('document') as DocumentSerializer;
        const modelClass = this.store.modelFor('document');

        // @ts-ignore types are wrong here - this works
        const normalizedResponse = serializer.normalizeArrayResponse(this.store, modelClass, results, this.data.id);

        const response = this.store.push(normalizedResponse);

        this.results = response;
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        if (this.data?.relatedrx) {
            taskFor(this.loadResults).perform(this.data?.id);
        }
    }

    @action
    onDataUpdate() {
        if (this.data?.relatedrx) {
            taskFor(this.loadResults).perform(this.data?.id);
        } else {
            this.results = [];
        }
    }
}
