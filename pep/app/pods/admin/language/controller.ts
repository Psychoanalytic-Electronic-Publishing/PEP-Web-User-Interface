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

    @action
    openCreatePublisher(): void {
        const changeset = createChangeset({}, CONFIGURATION_PUBLISHER_VALIDATIONS);
        this.modal.open('admin/publisher', {
            changeset
        });
    }

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

    @action
    editPublisher(publisher: Publisher) {
        const publishers = this.changeset?.get('configSettings').content.global.publishers as Publisher[];
        const newPublishers = publishers.map((item) => {
            if (item.sourceCode === publisher.sourceCode) {
                return publisher;
            } else {
                return item;
            }
        });
        this.changeset?.set('publishers', newPublishers);
    }

    @action
    deletePublisher(): void {}

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
                name: this.intl.t('mostCited.table.title'),
                isSortable: false
            },

            {
                name: this.intl.t('mostCited.table.fiveYears'),
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
