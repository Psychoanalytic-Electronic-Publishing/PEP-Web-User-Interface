import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import IntlService from 'ember-intl/services/intl';

import { ColumnValue } from '@gavant/ember-table';

import FastbootMediaService from 'pep/services/fastboot-media';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesMostCitedArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesMostCited extends Component<BaseGlimmerSignature<TablesMostCitedArgs>> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof TablesMostCited
     */
    @computed()
    get columns(): ColumnValue[] {
        return [
            {
                id: '0',
                valuePath: 'title',
                name: this.intl.t('mostCited.table.title'),
                isFixedLeft: false,
                width: 200,
                staticWidth: 200,
                cellComponent: 'tables/cell/most-viewed-publication',
                isSortable: false
            },

            {
                name: this.intl.t('mostCited.table.fiveYears'),
                valuePath: 'stat.art_cited_5',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostCited.table.tenYears'),
                valuePath: 'stat.art_cited_10',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostCited.table.twentyYears'),
                valuePath: 'stat.art_cited_20',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostCited.table.allTime'),
                valuePath: 'stat.art_cited_all',
                width: 100,
                staticWidth: 100,
                isSortable: true
            }
        ];
    }
}
