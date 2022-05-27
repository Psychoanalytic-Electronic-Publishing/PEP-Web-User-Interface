import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glimmer/component';

import Document from 'pep/pods/document/model';
import SearchSelection from 'pep/services/search-selection';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesCellCheckboxArgs {
    cellValue: string;
    rowValue: object;
    columnValue: {
        valuePath: string;
        reloadModels?(): any;
    };
}

export default class TablesCellCheckbox extends Component<BaseGlimmerSignature<TablesCellCheckboxArgs>> {
    @service searchSelection!: SearchSelection;

    /**
     * Returns true/false if table row is selected
     *
     * @readonly
     * @memberof TableCellCheckbox
     */
    get isRowSelected() {
        return this.searchSelection.isSelected(this.args.rowValue as Document);
    }

    /**
     * Toggles the selection of a row
     *
     * @param {string} rowId
     * @returns
     * @memberof TableCellCheckbox
     */
    @action
    toggleSelect(document: Document) {
        return this.searchSelection.toggleRecordSelection(document);
    }
}
