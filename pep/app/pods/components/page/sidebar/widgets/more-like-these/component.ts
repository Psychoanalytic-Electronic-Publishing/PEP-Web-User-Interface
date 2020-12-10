import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { DS } from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
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

    get data(): Document {
        return this.args.data[this.widget];
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.MORE_LIKE_THESE;
}
