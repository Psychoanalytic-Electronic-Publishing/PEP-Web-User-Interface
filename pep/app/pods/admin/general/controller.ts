import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';
import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { ExpertPick } from 'pep/constants/configuration';
import { CONFIGURATION_EXPERT_PICK_VALIDATIONS } from 'pep/validations/configuration/expert-pick';

export default class AdminGeneral extends Controller {
    @service intl!: IntlService;
    @service modal!: ModalService;

    @tracked changeset?: BufferedChangeset;

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
        this.changeset?.save();
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/general': AdminGeneral;
    }
}
