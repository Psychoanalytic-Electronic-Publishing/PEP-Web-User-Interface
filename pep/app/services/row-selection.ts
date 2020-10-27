import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Document from 'pep/pods/document/model';

export default class RowSelection extends Service {
    @tracked allRecords: boolean = false;
    @tracked includedRecords: Document[] = [];
    @tracked excludedRecords: Document[] = [];
    @tracked totalRecordCount: number = 0;

    /**
     * Returns a count of all selected rows
     *
     * @returns
     * @memberof RowSelectionService
     */
    get totalSelected() {
        return this.allRecords ? this.totalRecordCount - this.excludedRecords.length : this.includedRecords.length;
    }

    /**
     * Return true or false on the selected row
     *
     * @param {string} rowId
     * @returns
     * @memberof RowSelectionService
     */
    isSelected(row: Document) {
        return (
            (!this.allRecords && this.includedRecords.includes(row)) ||
            (this.allRecords && !this.excludedRecords.includes(row))
        );
    }

    /**
     * Clear the selections back to the default state
     *
     * @memberof RowSelection
     */
    clear() {
        this.includedRecords = [];
        this.excludedRecords = [];
        this.totalRecordCount = 0;
    }

    /**
     * Toggle the selected row
     *
     * @param {string} id
     * @memberof RowSelectionService
     */
    toggleRecordSelection(document: Document) {
        let includeRecordIds = this.includedRecords.concat([]);
        let excludeRecordIds = this.excludedRecords.concat([]);

        if (this.allRecords) {
            const selected = excludeRecordIds.includes(document);
            if (selected) {
                excludeRecordIds.removeObject(document);
            } else {
                excludeRecordIds.push(document);
            }
        } else {
            const selected = includeRecordIds.includes(document);
            if (selected) {
                includeRecordIds.removeObject(document);
            } else {
                includeRecordIds.push(document);
            }
        }

        if (this.allRecords && excludeRecordIds.length === this.totalRecordCount) {
            this.allRecords = false;
            excludeRecordIds = [];
        }

        this.includedRecords = includeRecordIds;
        this.excludedRecords = excludeRecordIds;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'row-selection': RowSelection;
    }
}
