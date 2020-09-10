import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { inject as service } from '@ember/service';
import CurrentUserService from 'pep/services/current-user';
import { action } from '@ember/object';
import Document from 'pep/pods/document/model';
import { tracked } from '@glimmer/tracking';
import { PreferenceKey } from 'pep/constants/preferences';

interface PageSidebarWidgetsFavoritesArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsFavorites extends Component<PageSidebarWidgetsFavoritesArgs> {
    @service currentUser!: CurrentUserService;
    @tracked results?: Document[];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.FAVORITES;

    /**
     * Load the documents that have been favorited by the user from local storage
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    loadFromUserPreferences() {
        this.results = this.currentUser.getDocuments(PreferenceKey.FAVORITES);
    }

    /**
     * Load the widget results on render or update
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    @action
    onElementChange() {
        this.loadFromUserPreferences();
    }

    /**
     * Add or remove favorites
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    removeFavorite(document: Document) {
        this.currentUser.removeDocument(PreferenceKey.FAVORITES, document);
    }
}
