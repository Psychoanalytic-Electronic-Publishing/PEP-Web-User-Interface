// @ts-ignore for some reason it thinks this doesn't exist
import { setComponentTemplate } from '@ember/component';

import ExpandableRow from '@gavant/ember-table/components/row/expandable-row';

// @ts-ignore - we cant import layouts correctly yet
import layout from 'pep/pods/components/tables/row/expandable-selected-row/template';

class TablesRowExpandableSelectedRow extends ExpandableRow {
    get isHighlighted() {
        return this.args.tableMeta?.document?.id === this.args.api.rowValue.id;
    }
}

export default setComponentTemplate(layout, TablesRowExpandableSelectedRow);
