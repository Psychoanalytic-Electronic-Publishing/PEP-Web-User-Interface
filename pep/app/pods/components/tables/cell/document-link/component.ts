import { TableCell, ColumnValue } from '@gavant/ember-table';
import Component from '@glimmer/component';

interface TablesCellDocumentLinkArgs {
    rowValue: Document;
    cellValue: string;
    columnValue: ColumnValue & {
        onClick: () => void;
    };
}

export default class TablesCellDocumentLink extends Component<TablesCellDocumentLinkArgs> {}
