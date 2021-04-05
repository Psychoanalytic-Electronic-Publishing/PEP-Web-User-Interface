import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';
import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { ExpertPick, WidgetConfiguration } from 'pep/constants/configuration';
import { SEARCH_TYPES, SearchTermId } from 'pep/constants/search';
import { AdminField } from 'pep/pods/admin/general/route';
import Configuration from 'pep/pods/configuration/model';
import { CONFIGURATION_EXPERT_PICK_VALIDATIONS } from 'pep/validations/configuration/expert-pick';

export default class AdminGeneral extends Controller {
    @service intl!: IntlService;
    @service modal!: ModalService;

    @tracked changeset?: BufferedChangeset;
    @tracked saveDisabled: boolean = false;
    @tracked fields: { id: number; field: SearchTermId }[] = [];
    @tracked leftSidebarItems: WidgetConfiguration[] = [];
    @tracked rightSidebarItems: WidgetConfiguration[] = [];
    mirrorOptions = {
        constrainDimensions: true
    };

    get searchTypeOptions() {
        return SEARCH_TYPES.filter((t) => t.isTypeOption);
    }

    /**
     * Open the expert pick modal
     *
     * @memberof AdminGeneral
     */
    @action
    openExpertPickModal(): void {
        const changeset = createChangeset({}, CONFIGURATION_EXPERT_PICK_VALIDATIONS);
        this.modal.open('admin/expert-pick', {
            changeset,
            actions: {
                onSave: this.createExpertPick
            }
        });
    }

    /**
     * Create the expert pick and update the changeset
     *
     * @param {ExpertPick} expertPick
     * @memberof AdminGeneral
     */
    @action
    createExpertPick(expertPick: ExpertPick): void {
        const expertPicks = this.changeset?.get('configSettings.home.expertPicks') as ExpertPick[];
        expertPicks.push(expertPick);
        this.changeset?.set('configSettings.home.expertPicks', [...expertPicks]);
    }

    /**
     * Delete the expert pick and update the changeset
     *
     * @param {Publisher} publisher
     * @memberof AdminLanguage
     */
    @action
    deleteExpertPick(expertPick: ExpertPick): void {
        const expertPicks = this.changeset?.get('configSettings.home.expertPicks') as ExpertPick[];
        const filteredPicks = expertPicks.filter((item) => item !== expertPick);
        this.changeset?.set('configSettings.home.expertPicks', [...filteredPicks]);
    }

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminLanguage
     */
    @computed('deleteExpertPick')
    get columns(): ColumnValue[] {
        return [
            {
                valuePath: 'articleId',
                name: this.intl.t('admin.common.home.expertPicks.table.article'),
                isSortable: false
            },

            {
                name: this.intl.t('admin.common.home.expertPicks.table.image'),
                valuePath: 'imageId',
                isSortable: true
            },
            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.deleteExpertPick,
                        icon: 'times'
                    }
                ]
            }
        ];
    }

    /**
     * Save the changeset to update the config
     *
     * @memberof AdminGeneral
     */
    @action
    save(): void {
        if (!this.saveDisabled) {
            this.changeset?.set(
                'configSettings.search.terms.defaultFields',
                this.fields.map((field) => field.field)
            );
            this.changeset?.set('configSettings.global.cards.left', this.leftSidebarItems);
            this.changeset?.set('configSettings.global.cards.right', this.rightSidebarItems);
            this.changeset?.save();
        }
    }

    /**
     * Update the open state of the widgets
     *
     * @param {GenericChangeset<Configuration>} changeset
     * @param {WidgetConfiguration} widget
     * @param {('right' | 'left')} column
     * @param {boolean} status
     * @memberof AdminGeneral
     */
    @action
    updateOpenState(
        changeset: GenericChangeset<Configuration>,
        index: number,
        column: 'right' | 'left',
        status: boolean
    ): void {
        this.saveDisabled = true;
        const columnWidgets = changeset?.get(`configSettings.global.cards.${column}`) as WidgetConfiguration[];
        columnWidgets[index].open = status;
        changeset?.set(`configSettings.global.cards.${column}`, [...columnWidgets]);
        this.saveDisabled = false;
    }

    /**
     * Modify the type of the default field
     *
     * @param {GenericChangeset<Configuration>} changeset
     * @param {number} index
     * @param {InputEvent} event
     * @memberof AdminGeneral
     */
    @action
    updateDefaultField(index: number, event: InputEvent): void {
        const defaultFields = this.fields;
        defaultFields[index] = {
            field: (event.target as HTMLSelectElement)?.value as SearchTermId,
            id: defaultFields[index].id
        };
    }

    /**
     * Update fields on re-order
     *
     * @param {AdminField[]} orderedArray
     * @memberof AdminGeneral
     */
    @action
    updateFields(orderedArray: AdminField[]): void {
        this.fields = orderedArray;
    }

    /**
     * Remove default field from list
     *
     * @param {GenericChangeset<Configuration>} changeset
     * @param {number} index
     * @memberof AdminGeneral
     */
    @action
    removeDefaultField(index: number): void {
        const defaultFields = [...this.fields];
        defaultFields.splice(index, 1);
        this.fields = [...defaultFields];
    }

    /**
     * Add in a default field to the array
     *
     * @param {GenericChangeset<Configuration>} changeset
     * @memberof AdminGeneral
     */
    @action
    addDefaultField(): void {
        this.fields = [...this.fields, { id: this.fields.length, field: SearchTermId.ARTICLE }];
    }

    /**
     * Update the left sidebar items
     *
     * @param {WidgetConfiguration[]} updates
     * @memberof AdminGeneral
     */
    @action
    updateLeftSidebarItems(updates: WidgetConfiguration[]) {
        this.leftSidebarItems = [...updates];
    }

    /**
     * Update the right sidebar items
     *
     * @param {WidgetConfiguration[]} updates
     * @memberof AdminGeneral
     */
    @action
    updateRightSidebarItems(updates: WidgetConfiguration[]) {
        this.rightSidebarItems = [...updates];
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/general': AdminGeneral;
    }
}
