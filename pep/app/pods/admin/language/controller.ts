import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import {
    AdminSpecifiedInformation, ContentConfiguration, Publisher, TourConfiguration
} from 'pep/constants/configuration';
import { Language } from 'pep/constants/lang';
import { TourStepId } from 'pep/constants/tour';
import FastbootMediaService from 'pep/services/fastboot-media';
import { Paths } from 'pep/utils/types';
import { CONFIGURATION_ADMIN_SPECIFIED_INFORMATION } from 'pep/validations/configuration/admin-specified-information';
import { CONFIGURATION_PUBLISHER_VALIDATIONS } from 'pep/validations/configuration/publisher';
import { CONFIGURATION_TOUR_STEP_VALIDATIONS } from 'pep/validations/configuration/tour-step';

export type TourConfigWithId = TourConfiguration & { id: TourStepId };

type LanguageModel = { configSettings: ContentConfiguration };
export default class AdminLanguage extends Controller {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;
    @service modal!: ModalService;

    @tracked changeset?: GenericChangeset<LanguageModel>;
    @tracked language?: Language;
    @tracked tour: TourConfigWithId[] = [];

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
                name: this.intl.t('admin.content.global.publishers.table.embargoYears'),
                cellComponent: 'tables/cell/html',
                valuePath: 'embargoYears',
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

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminLanguage
     */
    @computed('openEditTourStep')
    get tourColumns(): ColumnValue[] {
        return [
            {
                valuePath: 'id',
                name: this.intl.t('admin.content.global.tour.table.id'),
                isSortable: false
            },

            {
                name: this.intl.t('admin.content.global.tour.table.title'),
                valuePath: 'title',
                isSortable: true
            },
            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.openEditTourStep,
                        icon: 'edit'
                    }
                ]
            }
        ];
    }

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminLanguage
     */
    @computed('deleteAdminSpecifiedInformation', 'deletePublisher', 'openEditAdminSpecifiedInformation')
    get adminSpecifiedInformationColumns(): ColumnValue[] {
        return [
            {
                valuePath: 'id',
                name: this.intl.t('admin.content.global.adminSpecifiedInformation.id'),
                isSortable: false
            },

            {
                name: this.intl.t('admin.content.global.adminSpecifiedInformation.value'),
                valuePath: 'value',
                cellComponent: 'tables/cell/html',
                isSortable: true
            },
            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.openEditAdminSpecifiedInformation,
                        icon: 'edit'
                    },
                    {
                        action: this.deleteAdminSpecifiedInformation,
                        icon: 'times'
                    }
                ]
            }
        ];
    }

    /**
     * Save the english admin items
     *
     * @memberof AdminLanguage
     */
    @action
    save(): void {
        const tour = this.tour.reduce(
            (o, key) => ({
                ...o,
                [key.id]: {
                    text: key.text,
                    title: key.title
                }
            }),
            {}
        );
        this.changeset?.set('configSettings.global.tour', tour);
        this.changeset?.save();
    }

    /**
     * Open the create admin specified information item modal
     *
     * @memberof AdminLanguage
     */
    @action
    openCreateAdminSpecifiedInformation(): void {
        const changeset = createChangeset({}, CONFIGURATION_ADMIN_SPECIFIED_INFORMATION);
        this.modal.open('admin/admin-specified-information', {
            changeset,
            actions: {
                onSave: this.createAdminSpecifiedInformation
            }
        });
    }

    @action
    openEditAdminSpecifiedInformation(item: AdminSpecifiedInformation): void {
        const changeset = createChangeset(item, CONFIGURATION_ADMIN_SPECIFIED_INFORMATION);
        this.modal.open('admin/admin-specified-information', {
            changeset,
            actions: {
                onSave: this.editAdminSpecifiedInformation
            }
        });
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
     * Open edit tour step modal
     *
     * @param {Step} step
     * @memberof AdminLanguage
     */
    @action
    openEditTourStep(step: TourConfiguration & { id: TourStepId }): void {
        const changeset = createChangeset(step, CONFIGURATION_TOUR_STEP_VALIDATIONS);
        this.modal.open('admin/tour', {
            changeset,
            actions: {
                onSave: this.editTourStep
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
    editTourStep(step: TourConfigWithId): void {
        this.tour = this.tour.map((item) => {
            if (item.id === step.id) {
                return step;
            } else {
                return item;
            }
        });
    }

    /**
     *
     *
     * @param {AdminSpecifiedInformation} publisher
     * @memberof AdminLanguage
     */
    @action
    editAdminSpecifiedInformation(item: AdminSpecifiedInformation): void {
        this.editConfigItem('configSettings.global.adminSpecifiedInformationItems', item, 'id');
    }

    /**
     *
     *
     * @param {AdminSpecifiedInformation} item
     * @memberof AdminLanguage
     */
    @action
    createAdminSpecifiedInformation(item: AdminSpecifiedInformation): void {
        this.createConfigItem('configSettings.global.adminSpecifiedInformationItems', item);
    }

    /**
     *
     *
     * @param {AdminSpecifiedInformation} item
     * @memberof AdminLanguage
     */
    @action
    deleteAdminSpecifiedInformation(item: AdminSpecifiedInformation): void {
        this.deleteConfigItem('configSettings.global.adminSpecifiedInformationItems', item, 'id');
    }

    /**
     * Edit the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    editPublisher(publisher: Publisher): void {
        this.editConfigItem('configSettings.global.publishers', publisher, 'sourceCode');
    }

    /**
     * Create the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    createPublisher(publisher: Publisher): void {
        this.createConfigItem('configSettings.global.publishers', publisher);
    }

    /**
     * Delete the publisher and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    deletePublisher(publisher: Publisher): void {
        this.deleteConfigItem('configSettings.global.publishers', publisher, 'sourceCode');
    }

    /**
     * Add item to config by specifying path and the item
     *
     * @private
     * @template T
     * @param {Paths<LanguageModel>} path
     * @param {T} item
     * @memberof AdminLanguage
     */
    private createConfigItem<T>(path: Paths<LanguageModel>, item: T) {
        const items = this.changeset?.get(path) as T[];
        this.changeset?.set(path, [...items, item]);
    }

    /**
     * Edit item in config
     *
     * @private
     * @template T
     * @param {Paths<LanguageModel>} path
     * @param {T} itemToEdit
     * @param {keyof T} propertyToCompare
     * @memberof AdminLanguage
     */
    private editConfigItem<T>(path: Paths<LanguageModel>, itemToEdit: T, propertyToCompare: keyof T) {
        const items = this.changeset?.get(path) as T[];
        const modifiedItems = items.map((item) => {
            if (item[propertyToCompare] === itemToEdit[propertyToCompare]) {
                return itemToEdit;
            } else {
                return item;
            }
        });
        this.changeset?.set(path, modifiedItems);
    }

    /**
     * Delete item in config
     *
     * @private
     * @template T
     * @param {Paths<LanguageModel>} path
     * @param {T} itemToDelete
     * @param {keyof T} propertyToCompare
     * @memberof AdminLanguage
     */
    private deleteConfigItem<T>(path: Paths<LanguageModel>, itemToDelete: T, propertyToCompare: keyof T) {
        const items = this.changeset?.get(path) as T[];
        const filteredItems = items.filter((item) => item[propertyToCompare] !== itemToDelete[propertyToCompare]);
        this.changeset?.set(path, filteredItems);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/language': AdminLanguage;
    }
}
