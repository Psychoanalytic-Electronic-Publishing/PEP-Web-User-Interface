import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { ContentConfiguration, Publisher, TourConfiguration } from 'pep/constants/configuration';
import { Language } from 'pep/constants/lang';
import { TourStepId } from 'pep/constants/tour';
import FastbootMediaService from 'pep/services/fastboot-media';
import { CONFIGURATION_PUBLISHER_VALIDATIONS } from 'pep/validations/configuration/publisher';
import { CONFIGURATION_TOUR_STEP_VALIDATIONS } from 'pep/validations/configuration/tour-step';

export type TourConfigWithId = TourConfiguration & { id: TourStepId };
export default class AdminLanguage extends Controller {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;
    @service modal!: ModalService;

    @tracked changeset?: GenericChangeset<ContentConfiguration>;
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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/language': AdminLanguage;
    }
}
