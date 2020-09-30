import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { inject as service } from '@ember/service';
import CurrentUserService from 'pep/services/current-user';
import { action } from '@ember/object';
import Document from 'pep/pods/document/model';
import { tracked } from '@glimmer/tracking';
import { PreferenceKey } from 'pep/constants/preferences';
import { restartableTask } from 'ember-concurrency-decorators';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchFacetId } from 'pep/constants/search';
import DS from 'ember-data';
import { taskFor } from 'ember-concurrency-ts';

interface PageSidebarWidgetsReadLaterArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsReadLater extends Component<PageSidebarWidgetsReadLaterArgs> {
    @service currentUser!: CurrentUserService;
    @service store!: DS.Store;

    @tracked results?: Document[];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.READ_LATER;

    /**
     * Load the documents that have been marked to read later by the user from local storage
     *
     * @memberof PageSidebarWidgetsReadLater
     */
    @restartableTask
    *loadFromUserPreferences() {
        const ids = this.currentUser.getPreferenceDocuments(PreferenceKey.READ_LATER);
        if (ids.length) {
            const queryItems = ids.map((id) => {
                return {
                    id: SearchFacetId.ART_ID,
                    value: id
                };
            });

            const params = buildSearchQueryParams({
                facetValues: queryItems
            });
            const results = yield this.store.query('document', params);
            this.results = results.toArray();
        } else {
            this.results = [];
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    onElementChange() {
        taskFor(this.loadFromUserPreferences).perform();
    }

    /**
     * Add or remove read later document
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    removeReadLaterDocument(document: Document) {
        this.currentUser.removePreferenceDocument(PreferenceKey.READ_LATER, document.id);
    }
}
