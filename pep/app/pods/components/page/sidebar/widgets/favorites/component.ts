import ArrayProxy from '@ember/array/proxy';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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

interface PageSidebarWidgetsFavoritesArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsFavorites extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsFavoritesArgs>
> {
    @service store!: DS.Store;
    @service currentUser!: CurrentUserService;
    @service configuration!: ConfigurationService;
    @service('pep-session') session!: PepSessionService;

    @tracked results?: Document[];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.FAVORITES;

    /**
     * Load the documents that have been favorited by the user from local storage
     * TODO: We need to be smarter about this and try to pull from cache
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    @restartableTask
    *loadFromUserPreferences(): Generator<
        DS.AdapterPopulatedRecordArray<Document> & DS.PromiseArray<Document, ArrayProxy<Document>>,
        void,
        DS.AdapterPopulatedRecordArray<Document>
    > {
        const ids = this.currentUser.getPreferenceDocuments(PreferenceKey.FAVORITES);
        if (ids.length) {
            const queryItems = ids.map((id) => {
                return {
                    id: SearchFacetId.ART_ID,
                    value: id
                };
            });
            const params = buildSearchQueryParams({ facetValues: queryItems });
            const results = yield this.store.query('document', params);
            const resortedArrayByPreference = results.toArray().sort(function (a: Document, b: Document) {
                return ids.indexOf(a.id) - ids.indexOf(b.id);
            });
            this.results = resortedArrayByPreference;
        } else {
            this.results = [];
        }
    }

    /**
     * Load the widget results on render or update
     * TODO: This updates when the user changes their theme, or any change to the preferences object
     * since its immutable. We should eventually look at how to improve that
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    @action
    onElementChange() {
        taskFor(this.loadFromUserPreferences).perform();
    }

    /**
     * Add or remove favorites
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    removeFavorite(document: Document) {
        this.currentUser.removePreferenceDocument(PreferenceKey.FAVORITES, document.id);
    }
}
