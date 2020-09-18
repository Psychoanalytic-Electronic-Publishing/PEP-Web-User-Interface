import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { PreferenceDocumentsKey, PreferenceKey } from 'pep/constants/preferences';
import CurrentUserService from 'pep/services/current-user';
import Document from 'pep/pods/document/model';
import SidebarService from 'pep/services/sidebar';

interface SearchItemBibliographicArgs {
    item: Document;
    openResultPreview: () => void;
}

export default class SearchItemBibliographic extends Component<SearchItemBibliographicArgs> {
    @service currentUser!: CurrentUserService;
    @service sidebar!: SidebarService;

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.item')
    get favorited() {
        return this.currentUser.hasDocument(PreferenceKey.FAVORITES, this.args.item);
    }

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.item')
    get readLater() {
        return this.currentUser.hasDocument(PreferenceKey.READ_LATER, this.args.item);
    }

    /**
     * Add or remove read later documents
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    toggleReadLater(document: Document) {
        const key = PreferenceKey.READ_LATER;
        this.toggleDocument(key, document);
    }

    /**
     * Add or remove favorites
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    toggleFavorite(document: Document) {
        const key = PreferenceKey.FAVORITES;
        this.toggleDocument(key, document);
    }

    /**
     * Private method to add / remove a document from local storage preferences based on a key and the document
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @memberof SearchItem
     */
    toggleDocument(key: PreferenceDocumentsKey, document: Document) {
        if (this.currentUser.hasDocument(key, document)) {
            this.currentUser.removeDocument(key, document);
        } else {
            this.currentUser.addDocument(key, document);
        }
    }
}
