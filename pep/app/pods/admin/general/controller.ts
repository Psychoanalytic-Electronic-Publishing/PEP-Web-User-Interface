import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';
import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';
import { ColumnValue } from '@gavant/ember-table';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { ExpertPick, VideoConfiguration, WidgetConfiguration } from 'pep/constants/configuration';
import { SEARCH_TYPES, SearchTermId } from 'pep/constants/search';
import { AdminField } from 'pep/pods/admin/general/route';
import Configuration from 'pep/pods/configuration/model';
import { CONFIGURATION_EXPERT_PICK_VALIDATIONS } from 'pep/validations/configuration/expert-pick';
import { CONFIGURATION_VIDEO_VALIDATIONS } from 'pep/validations/configuration/video';

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
     * Open Video Modal
     *
     * @memberof AdminGeneral
     */
    @action
    openVideoModal() {
        const changeset = createChangeset({}, CONFIGURATION_VIDEO_VALIDATIONS);
        this.modal.open('admin/video', {
            changeset,
            actions: {
                onSave: this.createVideo
            }
        });
    }

    /**
     * Open topical video modal
     *
     * @memberof AdminGeneral
     */
    @action
    openTopicalVideoModal() {
        const changeset = createChangeset({}, CONFIGURATION_VIDEO_VALIDATIONS);
        this.modal.open('admin/video', {
            changeset,
            actions: {
                onSave: this.createTopicalVideo
            }
        });
    }

    /**
     * Create the topical lvideo object and add it to the changeset
     *
     * @param {VideoConfiguration} video
     * @memberof AdminGeneral
     */
    @action
    createTopicalVideo(video: VideoConfiguration): void {
        const previews = this.changeset?.get('configSettings.global.cards.topicalVideoPreviews');
        this.changeset?.set('configSettings.global.cards.topicalVideoPreviews', [...previews, video]);
    }

    /**
     * Create the video object and add it to the changeset
     *
     * @param {VideoConfiguration} video
     * @memberof AdminGeneral
     */
    @action
    createVideo(video: VideoConfiguration): void {
        const previews = this.changeset?.get('configSettings.global.cards.videoPreviews');
        this.changeset?.set('configSettings.global.cards.videoPreviews', [...previews, video]);
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
        this.changeset?.set('configSettings.home.expertPicks', [...expertPicks, expertPick]);
    }

    /**
     * Delete the expert pick and update the changeset
     *
     * @param {ExpertPick} expertPick
     * @memberof AdminGeneral
     */
    @action
    deleteExpertPick(expertPick: ExpertPick): void {
        const expertPicks = this.changeset?.get('configSettings.home.expertPicks') as ExpertPick[];
        const filteredPicks = expertPicks.filter((item) => item !== expertPick);
        this.changeset?.set('configSettings.home.expertPicks', filteredPicks);
    }

    /**
     * Delete the video
     *
     * @param {VideoConfiguration} video
     * @memberof AdminGeneral
     */
    @action
    deleteVideo(video: VideoConfiguration): void {
        const videos: VideoConfiguration[] = this.changeset?.get('configSettings.global.cards.videoPreviews');
        const newVideos = videos.filter((item) => item !== video);
        this.changeset?.set('configSettings.global.cards.videoPreviews', newVideos);
    }

    /**
     * Delete the topical video
     *
     * @param {VideoConfiguration} video
     * @memberof AdminGeneral
     */
    @action
    deleteTopicalVideo(video: VideoConfiguration): void {
        const videos: VideoConfiguration[] = this.changeset?.get('configSettings.global.cards.topicalVideoPreviews');
        const newVideos = videos.filter((item) => item !== video);
        this.changeset?.set('configSettings.global.cards.topicalVideoPreviews', newVideos);
    }

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminGeneral
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
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminGeneral
     */
    @computed('deleteVideo')
    get videoPreviewColumns(): ColumnValue[] {
        return [
            {
                valuePath: 'url',
                name: this.intl.t('admin.video.url'),
                isSortable: false
            },

            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.deleteVideo,
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
     * @memberof AdminGeneral
     */
    @computed('deleteTopicalVideo')
    get topicalVideoPreviewColumns(): ColumnValue[] {
        return [
            {
                valuePath: 'url',
                name: this.intl.t('admin.video.url'),
                isSortable: false
            },

            {
                cellComponent: 'tables/cell/actions',
                textAlign: 'right',
                cellClassNames: 'align-center',
                actions: [
                    {
                        action: this.deleteTopicalVideo,
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

    /**
     * If the element your dragging on is a label, cancel the drag. This prevents an accidental drag
     * when the user is trying to click on the checkbox
     *
     * @param {*} event
     * @memberof AdminGeneral
     */
    @action
    dragStart(event: any) {
        if (event.data.sensorEvent.data.target.tagName === 'LABEL') {
            event.cancel();
        }
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/general': AdminGeneral;
    }
}
