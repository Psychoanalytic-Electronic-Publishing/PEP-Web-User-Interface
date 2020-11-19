import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';

import Abstract from 'pep/pods/abstract/model';
import { SearchPreviewMode } from 'pep/pods/components/search/preview/component';
import SourceVolume from 'pep/pods/source-volume/model';
import Volume from 'pep/pods/volume/model';
import CurrentUserService from 'pep/services/current-user';

interface Issue {
    title: string;
    models: SourceVolume[];
}

export default class BrowseJournalVolume extends Controller {
    @service currentUser!: CurrentUserService;
    @tracked volumeInformation?: Volume;
    @tracked previewedResult?: Abstract | null = null;
    @tracked preview?: string | null = null;
    @tracked previewMode: SearchPreviewMode = 'fit';
    @tracked containerMaxHeight = 0;

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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/volume': BrowseJournalVolume;
    }
}
