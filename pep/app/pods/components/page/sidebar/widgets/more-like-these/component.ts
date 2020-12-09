import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { DS } from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Abstract from 'pep/pods/abstract/model';
import AbstractSerializer from 'pep/pods/abstract/serializer';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import SimilarityMatch from 'pep/pods/similarity-match/model';
import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsMoreLikeTheseArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMoreLikeThese extends Component<PageSidebarWidgetsMoreLikeTheseArgs> {
    @service store!: DS.Store;
    @service ajax!: AjaxService;
    @tracked results?: SimilarityMatch;
    similarCount = 5;

    get data(): Document {
        return this.args.data[this.widget];
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.MORE_LIKE_THESE;

    /**
     * Load the similar from the document they are reading. We are going around the store because we make other
     * calls without similarity matches and this one keeps getting overridden
     */
    @restartableTask
    *loadSimilarFromDocument() {
        if (this.data?.id) {
            const results = yield this.ajax.request(
                `/Documents/Abstracts/${this.data.id}?similarcount=${this.similarCount}`
            );

            const serializer = this.store.serializerFor('abstract') as AbstractSerializer;
            const modelClass = this.store.modelFor('abstract');

            // @ts-ignore types are wrong here - this works
            const normalizedResponse = serializer.normalizeSingleResponse(
                this.store,
                modelClass,
                results,
                this.data.id
            ) as { included: any[] };

            const response = this.store.push({ data: normalizedResponse.included });

            this.results = (Array.isArray(response) ? response[0] : response) as SimilarityMatch;
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementChange() {
        if (this.data?.id) {
            taskFor(this.loadSimilarFromDocument).perform();
        } else {
            this.results = undefined;
        }
    }
}
