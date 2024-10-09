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
     * Generate an issue title
     */
    private generateIssueTitle(sourceVolume: SourceVolume) {
        let issue = `Issue ${sourceVolume.issue}`;
        if (sourceVolume.issueTitle) {
            issue += ` - ${sourceVolume.issueTitle}`;
        }
        return issue;
    }

    readonly WITHOUT_ISSUES = 'withoutIssues';

    /**
     * Organize the models by issue number
     *
     * @readonly
     * @memberof BrowseJournalVolume
     */
    @cached
    get sortedModels() {
        const sortWithRomanNumeralsFirst = (a: SourceVolume, b: SourceVolume) => {
            const documentNumberA = a.documentID.split('.').pop();
            const documentNumberB = b.documentID.split('.').pop();

            if (!documentNumberA || !documentNumberB) {
                return 0;
            }

            if (documentNumberA.includes('R') && !documentNumberB.includes('R')) {
                // Roman numeral sections go first
                return -1;
            }

            if (!documentNumberA.includes('R') && documentNumberB.includes('R')) {
                // Roman numeral sections go first
                return 1;
            }

            if (a.documentID < b.documentID) {
                return -1;
            }

            if (a.documentID > b.documentID) {
                return 1;
            }

            return 0;
        };

        const modelArray = this.model.toArray();
        modelArray.sort(sortWithRomanNumeralsFirst);

        const volumesMap = new Map();
        modelArray.forEach((sourceVolume: any) => {
            const issue = sourceVolume.issue || this.WITHOUT_ISSUES;

            if (!volumesMap.has(issue)) {
                volumesMap.set(issue, {
                    title: issue !== this.WITHOUT_ISSUES ? this.generateIssueTitle(sourceVolume) : '',
                    groups: new Map(),
                    models: []
                });
            }

            const volume = volumesMap.get(issue);
            const sectionName = sourceVolume.newSectionName;

            if (sectionName && !volume?.groups.has(sectionName)) {
                volume?.groups.set(sectionName, {
                    title: sectionName,
                    models: []
                });
            }

            if (sectionName) {
                volume?.groups.get(sectionName)?.models.push(sourceVolume);
            } else {
                volume?.models.push(sourceVolume);
            }
        });

        // Sort by issue number
        const models = new Map(
            [...volumesMap.entries()].sort((a, b) => {
                return parseInt(a[0]) - parseInt(b[0]);
            })
        );

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
