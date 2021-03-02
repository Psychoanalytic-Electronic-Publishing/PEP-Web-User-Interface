import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';
import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { Publisher } from 'pep/constants/configuration';
import { Language } from 'pep/constants/lang';
import FastbootMediaService from 'pep/services/fastboot-media';
import { CONFIGURATION_PUBLISHER_VALIDATIONS } from 'pep/validations/configuration/publisher';

export default class AdminLanguage extends Controller {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;
    @service modal!: ModalService;

    @tracked changeset?: BufferedChangeset;
    @tracked language?: Language;

    /**
     * Save the english admin items
     *
     * @memberof AdminLanguage
     */
    @action
    save(): void {
        this.changeset?.save();
    }

    /**
     * Open the create publisher modal
     *
     * @memberof AdminLanguage
     */
    @action
    openCreatePublisher(): void {
        const changeset = createChangeset({}, CONFIGURATION_PUBLISHER_VALIDATIONS);
        this.modal.open('admin/publisher', {
            changeset,
            actions: {
                onSave: this.createPublisher
            }
        });
    }

    /**
     * Open the edit publisher modal
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    openEditPublisher(publisher: Publisher): void {
        const changeset = createChangeset(publisher, CONFIGURATION_PUBLISHER_VALIDATIONS);
        this.modal.open('admin/publisher', {
            changeset,
            actions: {
                onSave: this.editPublisher
            }
        });
    }

    /**
     * Edit the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    editPublisher(publisher: Publisher): void {
        const publishers = this.changeset?.get('configSettings.global.publishers') as Publisher[];
        const newPublishers = publishers.map((item) => {
            if (item.sourceCode === publisher.sourceCode) {
                return publisher;
            } else {
                return item;
            }
        });
        this.changeset?.set('configSettings.global.publishers', newPublishers);
    }

    /**
     * Create the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    createPublisher(publisher: Publisher): void {
        const publishers = this.changeset?.get('configSettings.global.publishers') as Publisher[];
        publishers.push(publisher);
        this.changeset?.set('configSettings.global.publishers', [...publishers]);
    }

    /**
     * Delete the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    deletePublisher(publisher: Publisher): void {
        const publishers = this.changeset?.get('configSettings.global.publishers') as Publisher[];
        const filteredPublishers = publishers.filter((item) => item.sourceCode !== publisher.sourceCode);
        this.changeset?.set('configSettings.global.publishers', [...filteredPublishers]);
    }

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminLanguage
     */
    @computed('deletePublisher', 'editPublisher', 'openEditPublisher')
    get columns(): ColumnValue[] {
        return [
            {
                valuePath: 'sourceCode',
                name: this.intl.t('admin.content.global.publishers.table.sourceCode'),
                isSortable: false
            },

            {
                name: this.intl.t('admin.content.global.publishers.table.description'),
                cellComponent: 'tables/cell/html',
                valuePath: 'description',
                isSortable: true
            },
            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.openEditPublisher,
                        icon: 'edit'
                    },
                    {
                        action: this.deletePublisher,
                        icon: 'times'
                    }
                ]
            }
        ];
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/language': AdminLanguage;
    }
}
