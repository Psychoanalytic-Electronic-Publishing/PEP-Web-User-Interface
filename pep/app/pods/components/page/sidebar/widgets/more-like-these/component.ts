import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import Document from 'pep/pods/document/model';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SimilarityMatch from 'pep/pods/similarity-match/model';
import { DS } from 'ember-data';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

interface PageSidebarWidgetsMoreLikeTheseArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMoreLikeThese extends Component<PageSidebarWidgetsMoreLikeTheseArgs> {
    @service store!: DS.Store;
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
     * Load the similar from the document they are reading
     */
    @restartableTask
    *loadSimilarFromDocument() {
        if (this.data?.id) {
            const results = yield this.store.findRecord('document', this.data.id, {
                reload: true,
                adapterOptions: { query: { similarcount: this.similarCount } }
            });
            const matches = results.similarityMatch.similarDocuments.filter(
                (item: Document) => item.id !== this.data.id
            );

            // TODO Right now the document that the find was called for is somehow being added into
            // the array. We should figure out why and fix it
            const similarityMatch = results.similarityMatch;
            similarityMatch.similarDocuments = matches;
            this.results = similarityMatch;
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementChange() {
        taskFor(this.loadSimilarFromDocument).perform();
    }
}
