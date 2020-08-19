import Component from '@glimmer/component';
import { ColumnValue } from '@gavant/ember-table';
interface TablesMostViewedArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesMostViewed extends Component<TablesMostViewedArgs> {
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
            name: 'Publication',
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
            name: 'Popularity by requests',
            width: 400,
            staticWidth: 400,
            maxWidth: 400,
            minWidth: 400,
            subcolumns: [
                { name: 'Last week', valuePath: 'stat.art_cited_5', width: 100, staticWidth: 100, isSortable: true },
                {
                    name: 'Last month',
                    valuePath: 'stat.art_cited_10',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: 'Last 6 months',
                    valuePath: 'stat.art_cited_20',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: 'Last calendar year',
                    valuePath: 'stat.art_cited_all',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                }
            ]
        }
    ];
}
