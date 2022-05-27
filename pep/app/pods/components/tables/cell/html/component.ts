import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesCellHtmlArgs {
    cellValue: string;
}

export default class TablesCellHtml extends Component<BaseGlimmerSignature<TablesCellHtmlArgs>> {}
