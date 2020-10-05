import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { ColumnValue } from '@gavant/ember-table';
import IntlService from 'ember-intl/services/intl';

import Document from 'pep/pods/document/model';
import FastbootMediaService from 'pep/services/fastboot-media';

interface TablesMostViewedArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesMostViewed extends Component<TablesMostViewedArgs> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof TablesMostViewed
     */
    @computed()
    get columns(): ColumnValue[] {
        return [
            {
                id: '0',
                valuePath: 'title',
                name: this.intl.t('mostViewed.table.publication'),
                isFixedLeft: false,
                width: 200,
                staticWidth: 200,
                cellComponent: 'tables/cell/most-viewed-publication',
                isSortable: true
            },

            {
                name: this.intl.t('mostViewed.table.week'),
                valuePath: 'stat.art_views_lastweek',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostViewed.table.month'),
                valuePath: 'stat.art_views_last1mos',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostViewed.table.sixMonths'),
                valuePath: 'stat.art_views_last6mos',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostViewed.table.twelveMonths'),
                valuePath: 'stat.art_views_last12mos',
                width: 100,
                staticWidth: 100,
                isSortable: true
            },
            {
                name: this.intl.t('mostViewed.table.calendarYear'),
                valuePath: 'stat.art_views_lastcalyear',
                width: 100,
                staticWidth: 100,
                isSortable: true
            }
        ];
    }
}
