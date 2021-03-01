import Component from '@glimmer/component';

interface TablesCellActionsArgs {}

export default class TablesCellActions extends Component<TablesCellActionsArgs> {
    classNames = ['data-table-cell-actions'];
    defaultButtonComponent = 'button-spinner';
    defaultButtonType = 'plain';
    defaultButtonSize = 'sm';
    defaultButtonSlim = true;
}
