import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import Document from 'pep/pods/document/model';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SimilarityMatch from 'pep/pods/similarity-match/model';
import { DS } from 'ember-data';

interface PageSidebarWidgetsMoreLikeTheseArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMoreLikeThese extends Component<PageSidebarWidgetsMoreLikeTheseArgs> {
    @service store!: DS.Store;
    @tracked results?: SimilarityMatch;

    get data(): Document {
        return this.args.data[this.widget];
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.MORE_LIKE_THESE;

    /**
     * Load the widget results data
     */

    @dontRunInFastboot
    async loadSimilarFromDocument() {
        if (this.data?.id) {
            const results = await this.store.findRecord('document', this.data.id, {
                reload: true,
                adapterOptions: { query: { similarcount: 2 } }
            });
            this.results = results.similarityMatch;
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    onElementInsert() {
        this.loadSimilarFromDocument();
    }
}
