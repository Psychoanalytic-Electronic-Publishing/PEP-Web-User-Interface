import Component from '@glimmer/component';

import { ColumnValue } from '@gavant/ember-table';

interface TablesCellDocumentLinkArgs {
    rowValue: Document;
    cellValue: string;
    columnValue: ColumnValue & {
        onClick: () => void;
    };
}

export default class TablesCellDocumentLink extends Component<TablesCellDocumentLinkArgs> {}
