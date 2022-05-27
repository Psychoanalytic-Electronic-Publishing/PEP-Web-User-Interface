import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

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

export default class TablesCellActions extends Component<BaseGlimmerSignature<TablesCellActionsArgs>> {
    classNames = ['data-table-cell-actions'];
    defaultButtonComponent = 'button-spinner';
    defaultButtonType = 'plain';
    defaultButtonSize = 'sm';
    defaultButtonSlim = true;
}
