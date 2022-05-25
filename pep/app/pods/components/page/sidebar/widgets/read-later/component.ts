import ArrayProxy from '@ember/array/proxy';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { PreferenceKey } from 'pep/constants/preferences';
import { SearchFacetId } from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import { buildSearchQueryParams } from 'pep/utils/search';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsReadLaterArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsReadLater extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsReadLaterArgs>
> {
    @service currentUser!: CurrentUserService;
    @service store!: DS.Store;
    @service configuration!: ConfigurationService;
    @service('pep-session') session!: PepSessionService;

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
    *loadFromUserPreferences(): Generator<
        DS.AdapterPopulatedRecordArray<Document> & DS.PromiseArray<Document, ArrayProxy<Document>>,
        void,
        DS.AdapterPopulatedRecordArray<Document>
    > {
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
            const resortedArrayByPreference = results.toArray().sort(function(a: Document, b: Document) {
                return ids.indexOf(a.id) - ids.indexOf(b.id);
            });
            this.results = resortedArrayByPreference;
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
