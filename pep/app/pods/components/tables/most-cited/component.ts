import Component from '@glimmer/component';
import { ColumnValue } from '@gavant/ember-table';
interface TablesMostCitedArgs {
    rows: Document[];
}

export default class TablesMostCited extends Component<TablesMostCitedArgs> {
    columns: ColumnValue[] = [
        {
            id: '0',
            valuePath: 'title',
            name: 'Title',
            isFixedLeft: false,
            width: 600,
            staticWidth: 600,
            maxWidth: 600,
            minWidth: 600,
            cellComponent: 'tables/cell/html'
        },
        {
            id: '1',
            valuePath: 'title',
            name: 'Title',
            isFixedLeft: false,
            width: 100,
            staticWidth: 100,
            maxWidth: 100,
            minWidth: 100,
            cellComponent: 'tables/cell/html'
        },
        {
            id: '2',
            valuePath: 'title',
            name: 'Title',
            isFixedLeft: false,
            width: 100,
            staticWidth: 100,
            maxWidth: 100,
            minWidth: 100,
            cellComponent: 'tables/cell/html'
        },
        {
            id: '3',
            valuePath: 'title',
            name: 'Title',
            isFixedLeft: false,
            width: 100,
            staticWidth: 100,
            maxWidth: 100,
            minWidth: 100,
            cellComponent: 'tables/cell/html'
        },
        {
            id: '4',
            valuePath: 'title',
            name: 'Title',
            isFixedLeft: false,
            width: 100,
            staticWidth: 100,
            maxWidth: 100,
            minWidth: 100,
            cellComponent: 'tables/cell/html'
        },

        {
            name: 'Test',
            subcolumns: [
                { name: 'A A', valuePath: 'A A', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 },
                { name: 'A C', valuePath: 'A C', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 },
                { name: 'A B', valuePath: 'A B', width: 100, staticWidth: 100 }
            ]
        }
    ];
}
