import Component from '@glimmer/component';
import { ColumnValue } from '@gavant/ember-table';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';
interface TablesMostViewedArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesMostViewed extends Component<TablesMostViewedArgs> {
    @service intl!: IntlService;

    /**
     *
     *
     * @type {ColumnValue[]}
     * @memberof TablesMostViewed
     */
    columns: ColumnValue[] = [
        {
            id: '0',
            valuePath: 'publication',
            name: this.intl.t('mostViewed.table.publication'),
            isFixedLeft: false,
            width: 200,
            staticWidth: 200,
            maxWidth: 200,
            minWidth: 200,
            cellComponent: 'tables/cell/html',
            isSortable: true
        },

        {
            id: '1',
            name: this.intl.t('mostViewed.table.popularity'),
            width: 400,
            staticWidth: 400,
            maxWidth: 400,
            minWidth: 400,
            subcolumns: [
                {
                    name: this.intl.t('mostViewed.table.week'),
                    valuePath: 'stat.art_cited_5',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: this.intl.t('mostViewed.table.month'),
                    valuePath: 'stat.art_cited_10',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: this.intl.t('mostViewed.table.sixMonths'),
                    valuePath: 'stat.art_cited_20',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: this.intl.t('mostViewed.table.calendarYear'),
                    valuePath: 'stat.art_cited_all',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                }
            ]
        }
    ];
}
