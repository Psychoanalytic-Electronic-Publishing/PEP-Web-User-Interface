import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import SourceVolume from 'pep/pods/source-volume/model';
import BrowseSelection from 'pep/services/browse-selection';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface BrowseVolumeItemArgs {
    item: SourceVolume;
    openResult: (id: string) => void;
}

export default class BrowseVolumeItem extends Component<BaseGlimmerSignature<BrowseVolumeItemArgs>> {
    @service browseSelection!: BrowseSelection;

    /**
     * Returns true/false if table row is selected
     *
     * @readonly
     * @memberof TableCellCheckbox
     */
    get isRowSelected() {
        return this.browseSelection.isSelected(this.args.item);
    }

    /**
     * Toggles the selection of a row
     *
     * @param {string} rowId
     * @returns
     * @memberof TableCellCheckbox
     */
    @action
    toggleSelect(volume: SourceVolume) {
        return this.browseSelection.toggleRecordSelection(volume);
    }
}
