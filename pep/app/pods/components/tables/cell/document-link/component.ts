import { action } from '@ember/object';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { ColumnValue } from '@gavant/ember-table';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesCellDocumentLinkArgs {
    rowValue: Document;
    cellValue: string;
    columnValue: ColumnValue & {
        onClick: (document: Document) => void;
    };
}

export default class TablesCellDocumentLink extends Component<BaseGlimmerSignature<TablesCellDocumentLinkArgs>> {
    /**
     * Prevent the default link action and pass the document up
     *
     * @param {Document} document
     * @param {Event} event
     * @memberof TablesCellDocumentLink
     */
    @action
    onClick(document: Document, event: Event) {
        event.preventDefault();
        this.args.columnValue.onClick(document);
    }
}
