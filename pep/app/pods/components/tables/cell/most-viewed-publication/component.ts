import Component from '@glimmer/component';

import { TableCell } from '@gavant/ember-table';

import Document from 'pep/pods/document/model';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesCellMostViewedPublicationArgs extends TableCell<Document> {}

export default class TablesCellMostViewedPublication extends Component<
    BaseGlimmerSignature<TablesCellMostViewedPublicationArgs>
> {}
