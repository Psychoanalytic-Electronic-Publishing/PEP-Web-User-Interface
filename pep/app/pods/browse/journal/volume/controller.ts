import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import ENV from 'pep/config/environment';
import { TITLE_REGEX } from 'pep/constants/regex';
import Abstract from 'pep/pods/abstract/model';
import { SearchPreviewMode } from 'pep/pods/components/search/preview/component';
import Document from 'pep/pods/document/model';
import SourceVolume from 'pep/pods/source-volume/model';
import Volume from 'pep/pods/volume/model';
import BrowseSelection from 'pep/services/browse-selection';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import PrinterService from 'pep/services/printer';

interface Issue {
    title?: string;
    models: SourceVolume[];
}

export default class BrowseJournalVolume extends Controller {
    @service currentUser!: CurrentUserService;
    @service exports!: ExportsService;
    @service browseSelection!: BrowseSelection;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service printer!: PrinterService;

    @tracked volumeInformation?: Volume;
    @tracked previewedResult?: Abstract | null = null;
    @tracked preview?: string | null = null;
    @tracked previewMode: SearchPreviewMode = 'fit';
    @tracked containerMaxHeight = 0;
    @tracked meta?: { next_vol: string; prev_vol: string };
    @tracked sourcecode?: string;

    assetBaseUrl = ENV.assetBaseUrl;

    get journalImageUrl() {
        return `${this.assetBaseUrl}assets/images/publisher-logos/banner${this.sourcecode}Logo.gif`;
    }

    /**
     * If items are selected, use that for the export/print data. Otherwise use the paginator
     *
     * @readonly
     * @memberof BrowseJournalVolume
     */
    get exportedData() {
        return this.browseSelection.includedRecords.length
            ? this.browseSelection.includedRecords
            : (this.model as SourceVolume[]);
    }

    queryParams = ['preview'];

    /**
     * Organize the models by issue number
     *
     * @readonly
     * @memberof BrowseJournalVolume
     */
    @cached
    get sortedModels() {
        const model = this.model as SourceVolume[];
        const models = model.reduce<{
            [key: string]: Issue;
        }>(
            (sortedModels, sourceVolume) => {
                const issue = sourceVolume.issue;
                if (issue) {
                    if (!sortedModels[issue]) {
                        sortedModels[issue] = {
                            title: sourceVolume.issueTitle,
                            models: [sourceVolume]
                        };
                    } else {
                        sortedModels[issue].models.push(sourceVolume);
                    }
                } else {
                    sortedModels.withoutIssues.models.push(sourceVolume);
                }
                return sortedModels;
            },
            {
                withoutIssues: {
                    models: []
                }
            }
        );
        const result = Object.keys(models).map((key) => {
            return models[key];
        });

        return result;
    }

    /**
     * Sets the max height of the search preview pane
     * @param {HTMLElement} element
     * @memberof BrowseJournalVolume
     */
    @action
    updateContainerMaxHeight(element: HTMLElement) {
        this.containerMaxHeight = element.offsetHeight;
    }

    /**
     * Set the current preview mode
     * @param {String} mode
     * @memberof BrowseJournalVolume
     */
    @action
    setPreviewMode(mode: SearchPreviewMode) {
        this.previewMode = mode;
    }

    /**
     * Close the preview pane
     * @memberof BrowseJournalVolume
     */
    @action
    closeResultPreview() {
        this.preview = null;
        this.previewedResult = null;
    }

    /**
     * Opens the selected result in the preview pane or the full read page,
     * depending on the user's preferences
     * @param {Object} result
     * @param {Event} event
     * @memberof BrowseJournalVolume
     */
    @action
    async openResult(documentId: string, event?: Event) {
        event?.preventDefault();
        if (this.currentUser.preferences?.searchPreviewEnabled) {
            const abstract = await this.store.findRecord('abstract', documentId);
            this.previewedResult = abstract;
            this.preview = documentId;
        } else {
            this.transitionToRoute('browse.read', documentId);
        }
    }

    /**
     * Export a CSV
     *
     * @memberof BrowseJournalVolume
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
     * Get the correctly formatted data for the clipboard and return it
     *
     * @returns
     * @memberof BrowseJournalVolume
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
     * Show success message for clipboard
     *
     * @memberof BrowseJournalVolume
     */
    @action
    clipboardSuccess() {
        const translation = this.intl.t('exports.clipboard.success');

        this.notifications.success(translation);
    }

    /**
     * Show failure message for clipboard
     *
     * @memberof BrowseJournalVolume
     */
    @action
    clipboardFailure() {
        this.notifications.success(this.intl.t('exports.clipboard.failure'));
    }

    /**
     * Print the current selected items or whats loaded into the paginator
     *
     * @memberof BrowseJournalVolume
     */
    @action
    print() {
        const data = this.exportedData;
        const html = this.printer.dataToBibliographicHTML(data);
        this.printer.printHTML(html);
    }

    /**
     * Navigate to the specific volume
     *
     * @param {string} volume
     * @memberof BrowseJournalVolume
     */
    @action
    navigateToVolume(volume: string) {
        this.transitionToRoute('browse.journal.volume', volume);
    }

    /**
     * Navigate to the passed in document
     *
     * @param {Abstract} Abstract
     * @memberof BrowseJournalVolume
     */
    @action
    loadDocument(abstract: Abstract) {
        this.transitionToRoute('browse.read', abstract.id);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/volume': BrowseJournalVolume;
    }
}
