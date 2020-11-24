import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

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
    title: string;
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

    /**
     * If items are selected, use that for the export/print data. Otherwise use the paginator
     *
     * @readonly
     * @memberof Search
     */
    get exportedData() {
        return this.browseSelection.includedRecords.length ? this.browseSelection.includedRecords : this.model;
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

        const models = model.reduce<{ [key: string]: Issue }>((sortedModels, sourceVolume) => {
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
            }
            return sortedModels;
        }, {});
        const result = Object.keys(models).map((key) => {
            return models[key];
        });

        return result;
    }

    /**
     * Sets the max height of the search preview pane
     * @param {HTMLElement} element
     */
    @action
    updateContainerMaxHeight(element: HTMLElement) {
        this.containerMaxHeight = element.offsetHeight;
    }

    /**
     * Set the current preview mode
     * @param {String} mode
     */
    @action
    setPreviewMode(mode: SearchPreviewMode) {
        this.previewMode = mode;
    }

    /**
     * Close the preview pane
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
     */
    @action
    async openResult(documentId: string, event?: Event) {
        event?.preventDefault();
        if (this.currentUser.preferences?.searchPreviewEnabled) {
            const abstract = await this.store.findRecord('abstract', documentId);
            this.previewedResult = abstract;
            this.preview = documentId;
        } else {
            this.transitionToRoute('read.document', documentId);
        }
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
     * Print the current selected items or whats loaded into the paginator
     *
     * @memberof Search
     */
    @action
    print() {
        const data = this.exportedData;
        const html = this.printer.dataToBibliographicHTML(data);
        this.printer.printHTML(html);
    }

    @action
    navigateToVolume(volume: string) {
        this.transitionToRoute('browse.journal.volume', volume);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/volume': BrowseJournalVolume;
    }
}
