import Component from '@glimmer/component';
import { ColumnValue } from '@gavant/ember-table';
interface TablesMostCitedArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesMostCited extends Component<TablesMostCitedArgs> {
    columns: ColumnValue[] = [
        {
            id: '0',
            valuePath: 'title',
            name: 'Title',
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
            name: 'Publication Citations',
            width: 400,
            staticWidth: 400,
            maxWidth: 400,
            minWidth: 400,
            subcolumns: [
                { name: 'Last 5 years', valuePath: 'stat.art_cited_5', width: 100, staticWidth: 100, isSortable: true },
                {
                    name: 'Last 10 years',
                    valuePath: 'stat.art_cited_10',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                {
                    name: 'Last 20 years',
                    valuePath: 'stat.art_cited_20',
                    width: 100,
                    staticWidth: 100,
                    isSortable: true
                },
                { name: 'All Time', valuePath: 'stat.art_cited_all', width: 100, staticWidth: 100, isSortable: true }
            ]
        }
    ];
}
