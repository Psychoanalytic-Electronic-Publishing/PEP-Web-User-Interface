import Component from '@glimmer/component';
import { TableCell } from '@gavant/ember-table';
import Document from 'pep/pods/document/model';

interface TablesCellMostViewedPublicationArgs extends TableCell<Document> {}

export default class TablesCellMostViewedPublication extends Component<TablesCellMostViewedPublicationArgs> {}
