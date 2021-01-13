import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { PreferenceKey } from 'pep/constants/preferences';
import { TITLE_REGEX } from 'pep/constants/regex';
import { SearchView, SearchViews, SearchViewType } from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import PrinterService from 'pep/services/printer';
import SearchSelection from 'pep/services/search-selection';
import { SearchSorts, SearchSortType, transformSearchSortsToTable, transformSearchSortToAPI } from 'pep/utils/sort';
import { resolve } from 'rsvp';

interface DocumentReadSidebarArgs {
    selectedDocument: Document;
    paginator: Pagination<Document>;
    selectedView: SearchView;
    hitsInContextAvailable: boolean;
    loadDocument: (document: Document) => void;
    updateSelectedView: (searchView?: SearchView) => void;
}

export default class DocumentReadSidebar extends Component<DocumentReadSidebarArgs> {
    @service router!: RouterService;
    @service searchSelection!: SearchSelection;
    @service exports!: ExportsService;
    @service intl!: IntlService;
    @service notifications!: NotificationService;
    @service printer!: PrinterService;
    @service fastboot!: FastbootService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    @tracked showHitsInContext = this.currentUser.preferences?.searchHICEnabled;
    @tracked selectedSort = SearchSorts[0];

    readLaterKey = PreferenceKey.READ_LATER;
    favoritesKey = PreferenceKey.FAVORITES;
    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    get isLoadingRoute(): boolean {
        return /loading$/.test(this.router.currentRouteName);
    }

    /**
     * If items are selected, use that for the export/print data. Otherwise use the paginator
     *
     * @readonly
     * @memberof Search
     */
    get exportedData() {
        return this.searchSelection.includedRecords.length
            ? this.searchSelection.includedRecords
            : this.args.paginator.models;
    }

    get tableSorts() {
        return transformSearchSortsToTable(this.args.paginator.sorts);
    }

    get defaultSearchParams() {
        return this.configuration.defaultSearchParams;
    }

    /**
     * Update whether to show hits in context or not
     *
     * @param {boolean} value
     * @memberof Search
     */
    @action
    async updateHitsInContext(value: boolean) {
        // Load more models to make up for the difference in height between displaying HIC and not
        // so the user doesn't see a blank white space
        if (!value) {
            await this.args.paginator.loadMoreModels();
        }
        this.showHitsInContext = value;
    }

    /**
     * Export a CSV
     *
     * @memberof Search
     */
    @action
    exportCSV() {
        const data = this.exportedData;
        const formattedData = data.map((item) => [
            item.authorMast,
            item.year,
            item.title.replace(TITLE_REGEX, '$1'),
            item.documentRef
        ]);
        this.exports.export(ExportType.CSV, 'data.csv', {
            fields: ['Author', 'Year', 'Title', 'Source'],
            data: [...formattedData]
        });
    }

    /**
     * Show success message for clipboard
     *
     * @memberof Search
     */
    @action
    clipboardSuccess() {
        const translation = this.intl.t('exports.clipboard.success');

        this.notifications.success(translation);
    }

    /**
     * Show failure message for clipboard
     *
     * @memberof Search
     */
    @action
    clipboardFailure() {
        this.notifications.success(this.intl.t('exports.clipboard.failure'));
    }

    /**
     * Get the correctly formatted data for the clipboard and return it
     *
     * @returns
     * @memberof Search
     */
    @action
    exportClipboard() {
        const data = this.exportedData;
        const formattedData = data.map(
            (item) => `${item.authorMast}, ${item.year}, ${item.title.replace(TITLE_REGEX, '$1')}, ${item.documentRef}`
        );
        return formattedData.join('\r\n');
    }

    /**
     * Print the current selected items or whats loaded into the paginator
     *
     * @memberof Search
     */
    @action
    print() {
        const data = this.exportedData;
        if (this.args.selectedView.id === SearchViewType.BIBLIOGRAPHIC) {
            const html = this.printer.dataToBibliographicHTML(data);
            this.printer.printHTML(html);
        } else {
            this.printer.printJSON<Document>(data, [
                {
                    field: 'authorMast',
                    displayName: this.intl.t('print.author')
                },
                {
                    field: 'year',
                    displayName: this.intl.t('print.year')
                },
                {
                    field: 'title',
                    displayName: this.intl.t('print.title')
                },
                {
                    field: 'documentRef',
                    displayName: this.intl.t('print.source')
                }
            ]);
        }
    }

    /**
     * Update the sort for the list
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof Search
     */
    @action
    updateSort(event: HTMLElementEvent<HTMLSelectElement>) {
        const id = event.target.value as SearchSortType;
        const selectedSort = SearchSorts.find((item) => item.id === id);
        if (selectedSort) {
            this.selectedSort = selectedSort;
            this.args.paginator.changeSorting([
                {
                    valuePath: id,
                    isAscending: true
                }
            ]);
        }
    }

    /**
     * Update which view to show - table or list
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof Search
     */
    @action
    updateSelectedView(event: HTMLElementEvent<HTMLSelectElement>) {
        const id = event.target.value as SearchViewType;
        const selectedView = SearchViews.find((item) => item.id === id);
        this.args.updateSelectedView(selectedView);
    }

    /**
     * Transform the sorting to a format the API can handle
     *
     * @param {string[]} sorts
     * @returns
     * @memberof Search
     */
    @action
    onChangeSorting(sorts: string[]) {
        return resolve(transformSearchSortToAPI(sorts));
    }
}
