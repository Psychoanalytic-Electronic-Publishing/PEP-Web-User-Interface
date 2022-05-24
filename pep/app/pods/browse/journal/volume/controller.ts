import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { TITLE_REGEX } from 'pep/constants/regex';
import Abstract from 'pep/pods/abstract/model';
import VolumeRoute from 'pep/pods/browse/journal/volume/route';
import Journal from 'pep/pods/journal/model';
import SourceVolume from 'pep/pods/source-volume/model';
import Volume from 'pep/pods/volume/model';
import BrowseSelection from 'pep/services/browse-selection';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import PrinterService from 'pep/services/printer';
import { RouteModel } from 'pep/utils/types';

interface Issue {
    title?: string;
    groups: Map<
        string,
        {
            title?: string;
            models: SourceVolume[];
        }
    >;
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
    @tracked containerMaxHeight = 0;
    @tracked meta?: { next_vol: string; prev_vol: string };
    @tracked sourcecode?: string;
    @tracked journal?: Journal;

    declare model: RouteModel<VolumeRoute>;

    /**
     * If items are selected, use that for the export/print data. Otherwise use the paginator
     *
     * @readonly
     * @memberof BrowseJournalVolume
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
        const models = this.model.reduce<Map<string, Issue>>((volumes, sourceVolume) => {
            const issue = `Issue ${sourceVolume.issue} - ${sourceVolume.issueTitle}`;
            const groupInIssue = sourceVolume.newSectionName;
            if (issue) {
                // If we have no key for this issue yet, create it
                if (issue && !volumes.has(issue)) {
                    volumes.set(issue, {
                        title: issue,
                        groups: new Map(),
                        models: []
                    });
                }

                // If we have no key for this group in this issue yet, create it
                if (groupInIssue && !volumes.get(issue)?.groups.has(groupInIssue)) {
                    volumes.get(issue)?.groups.set(groupInIssue, {
                        title: groupInIssue,
                        models: []
                    });
                }

                if (issue && groupInIssue) {
                    volumes
                        .get(issue)
                        ?.groups.get(groupInIssue)
                        ?.models.push(sourceVolume);
                } else {
                    volumes.get(issue)?.models.push(sourceVolume);
                }
            } else {
                if (volumes.has('withoutIssues')) {
                    volumes.get('withoutIssues')?.models.push(sourceVolume);
                } else {
                    volumes.set('withoutIssues', {
                        title: 'withoutIssues',
                        groups: new Map(),
                        models: [sourceVolume]
                    });
                }
            }

            return volumes;
        }, new Map());

        return models;
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
        const data = this.exportedData as SourceVolume[];
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
