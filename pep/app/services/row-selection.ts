import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class RowSelection extends Service {
    @tracked allRecords: boolean = false;
    @tracked includeRecordIds: string[] = [];
    @tracked excludeRecordIds: string[] = [];
    @tracked totalRecordCount: number = 0;

    /**
     * Returns a count of all selected rows
     *
     * @returns
     * @memberof RowSelectionService
     */
    get totalSelected() {
        return this.allRecords ? this.totalRecordCount - this.excludeRecordIds.length : this.includeRecordIds.length;
    }

    /**
     * Return true or false on the selected row
     *
     * @param {string} rowId
     * @returns
     * @memberof RowSelectionService
     */
    isSelected(rowId: string) {
        const selectedRow = rowId;
        return (
            (!this.allRecords && this.includeRecordIds.includes(selectedRow)) ||
            (this.allRecords && !this.excludeRecordIds.includes(selectedRow))
        );
    }

    /**
     * Toggle the selection of all rows
     *
     * @memberof RowSelectionService
     */
    toggleSelectAllRecords() {
        if (!this.allRecords) {
            this.includeRecordIds = [];
            this.allRecords = true;
        } else {
            this.excludeRecordIds = [];
            this.allRecords = false;
        }
    }

    /**
     * Toggle the selected row
     *
     * @param {string} id
     * @memberof RowSelectionService
     */
    toggleRecordSelection(id: string) {
        let includeRecordIds = this.includeRecordIds.concat([]);
        let excludeRecordIds = this.excludeRecordIds.concat([]);
        const rowId = id;

        if (this.allRecords) {
            const selected = excludeRecordIds.includes(rowId);
            if (selected) {
                excludeRecordIds.removeObject(rowId);
            } else {
                excludeRecordIds.push(rowId);
            }
        } else {
            const selected = includeRecordIds.includes(rowId);
            if (selected) {
                includeRecordIds.removeObject(rowId);
            } else {
                includeRecordIds.push(rowId);
            }
        }

        if (this.allRecords && excludeRecordIds.length === this.totalRecordCount) {
            this.allRecords = false;
            excludeRecordIds = [];
        }

        this.includeRecordIds = includeRecordIds;
        this.excludeRecordIds = excludeRecordIds;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'row-selection': RowSelection;
    }
}
