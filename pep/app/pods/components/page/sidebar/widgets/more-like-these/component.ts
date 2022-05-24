import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { DS } from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import AbstractSerializer from 'pep/pods/abstract/serializer';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import SimilarityMatch from 'pep/pods/similarity-match/model';
import AjaxService from 'pep/services/ajax';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsMoreLikeTheseArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMoreLikeThese extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsMoreLikeTheseArgs>
> {
    @service store!: DS.Store;
    @service ajax!: AjaxService;
    @service configuration!: ConfigurationService;

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
    *loadSimilarFromDocument(): Generator<Promise<unknown>, void, unknown> {
        if (this.data?.id) {
            const results = yield this.ajax.request(
                `/Database/MoreLikeThis?morelikethis=${this.data.id}&similarcount=${this.similarCount}`
            );

            const serializer = this.store.serializerFor('abstract') as AbstractSerializer;
            const modelClass = this.store.modelFor('abstract');

            // @ts-ignore types are wrong here - this works
            const normalizedResponse = serializer.normalizeArrayResponse(
                this.store,
                modelClass,
                results,
                this.data.id
            ) as { included: any[] };
            if (normalizedResponse.included.length) {
                const response = this.store.push({
                    data: normalizedResponse.included[0],
                    included: normalizedResponse.included
                });
                this.results = (Array.isArray(response) ? response[0] : response) as SimilarityMatch;
            }
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
