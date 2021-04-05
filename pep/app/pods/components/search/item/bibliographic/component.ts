import { action, computed } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { PreferenceDocumentsKey, PreferenceKey } from 'pep/constants/preferences';
import Document from 'pep/pods/document/model';
import CurrentUserService from 'pep/services/current-user';
import SearchSelection from 'pep/services/search-selection';
import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { updateUserPreferencesDocument } from 'pep/utils/user';

interface SearchItemBibliographicArgs {
    item: Document;
    openResult: (document: Document) => void;
    showFavorites?: boolean;
    showReadLater?: boolean;
    highlight?: boolean;
    showHitsInContext: boolean;
}

export default class SearchItemBibliographic extends Component<BaseGlimmerSignature<SearchItemBibliographicArgs>> {
    @service currentUser!: CurrentUserService;
    @service sidebar!: SidebarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service searchSelection!: SearchSelection;
    @service router!: RouterService;

    get showFavorites() {
        return typeof this.args.showFavorites === 'boolean' ? this.args.showFavorites : true;
    }

    get showReadLater() {
        return typeof this.args.showReadLater === 'boolean' ? this.args.showReadLater : true;
    }

    get documentUrl() {
        return this.router.urlFor('search.read', this.args.item.id);
    }

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.item.id')
    get favorited() {
        return this.currentUser.hasPreferenceDocument(PreferenceKey.FAVORITES, this.args.item.id);
    }

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.item.id')
    get readLater() {
        return this.currentUser.hasPreferenceDocument(PreferenceKey.READ_LATER, this.args.item.id);
    }

    /**
     *  Returns true/false if row is selected
     *
     * @readonly
     * @memberof SearchItemBibliographic
     */
    get isSelected() {
        return this.searchSelection.isSelected(this.args.item);
    }

    /**
     * Toggles the selection of a row
     *
     * @param {string} rowId
     * @returns
     * @memberof SearchItemBibliographic
     */
    @action
    toggleSelect(document: Document) {
        return this.searchSelection.toggleRecordSelection(document);
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
        return updateUserPreferencesDocument(this, key, document);
    }

    /**
     * Prevent the default link action and pass the document up
     *
     * @param {Document} document
     * @param {Event} event
     * @memberof SearchItemBibliographic
     */
    @action
    openResult(document: Document, event: Event) {
        event.preventDefault();
        this.args.openResult(document);
    }
}
