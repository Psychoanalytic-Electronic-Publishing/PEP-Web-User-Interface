import Component from '@glimmer/component';

interface TablesCellActionsArgs {
    cellValue: string;
    rowValue: object;
    columnValue: {
        valuePath: string;
    };
    rowMeta: object;
    cellMeta: object;
    columnMeta: object;
}

export default class TablesCellActions extends Component<TablesCellActionsArgs> {
    classNames = ['data-table-cell-actions'];
    defaultButtonComponent = 'button-spinner';
    defaultButtonType = 'plain';
    defaultButtonSize = 'sm';
    defaultButtonSlim = true;
}
