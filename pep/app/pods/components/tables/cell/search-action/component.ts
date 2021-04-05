import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { PreferenceDocumentsKey, PreferenceKey } from 'pep/constants/preferences';
import Document from 'pep/pods/document/model';
import CurrentUserService from 'pep/services/current-user';
import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { updateUserPreferencesDocument } from 'pep/utils/user';

interface TablesCellSearchActionArgs {
    showFavorites?: boolean;
    showReadLater?: boolean;
    rowValue: Document;
}

export default class TablesCellSearchAction extends Component<BaseGlimmerSignature<TablesCellSearchActionArgs>> {
    @service currentUser!: CurrentUserService;
    @service sidebar!: SidebarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;

    get showFavorites() {
        return this.args.showFavorites ?? true;
    }

    get showReadLater() {
        return this.args.showReadLater ?? true;
    }

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.rowValue.id')
    get favorited() {
        return this.currentUser.hasPreferenceDocument(PreferenceKey.FAVORITES, this.args.rowValue.id);
    }

    /**
     * Using a computed here so we A) dont dip into the local storage too often and B) so that this
     * is recomputed whenever the preferences object is updated
     *
     * @readonly
     * @memberof SearchItem
     */
    @computed('currentUser.preferences', 'args.rowValue.id')
    get readLater() {
        return this.currentUser.hasPreferenceDocument(PreferenceKey.READ_LATER, this.args.rowValue.id);
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
}
