import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { inject as service } from '@ember/service';
import CurrentUserService from 'pep/services/current-user';
import { action } from '@ember/object';
import Document from 'pep/pods/document/model';
import { tracked } from '@glimmer/tracking';
import { PreferenceKey } from 'pep/constants/preferences';

interface PageSidebarWidgetsReadLaterArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsReadLater extends Component<PageSidebarWidgetsReadLaterArgs> {
    @service currentUser!: CurrentUserService;
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
    loadFromUserPreferences() {
        this.results = this.currentUser.getDocuments(PreferenceKey.READ_LATER);
    }

    /**
     * Load the widget results on render
     */
    @action
    onElementChange() {
        this.loadFromUserPreferences();
    }

    /**
     * Add or remove read later document
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    removeReadLaterDocument(document: Document) {
        this.currentUser.removeDocument(PreferenceKey.READ_LATER, document);
    }
}
