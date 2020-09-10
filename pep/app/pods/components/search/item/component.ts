import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { PreferenceKey } from 'pep/constants/preferences';
import CurrentUserService from 'pep/services/current-user';
import Document from 'pep/pods/document/model';

interface SearchItemArgs {
    item: Document;
    openResultPreview: () => void;
}

export default class SearchItem extends Component<SearchItemArgs> {
    @service currentUser!: CurrentUserService;

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
        if (this.currentUser.hasDocument(PreferenceKey.READ_LATER, document)) {
            this.currentUser.removeDocument(PreferenceKey.READ_LATER, document);
        } else {
            this.currentUser.addDocument(PreferenceKey.READ_LATER, document);
        }
    }

    /**
     * Add or remove favorites
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    toggleFavorite(document: Document) {
        if (this.currentUser.hasDocument(PreferenceKey.FAVORITES, document)) {
            this.currentUser.removeDocument(PreferenceKey.FAVORITES, document);
        } else {
            this.currentUser.addDocument(PreferenceKey.FAVORITES, document);
        }
    }
}
