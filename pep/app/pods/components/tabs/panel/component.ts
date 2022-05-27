import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface TabsPanelArgs {
    id: string;
    selected: string;
}

export default class TabsPanel extends Component<BaseGlimmerSignature<TabsPanelArgs>> {
    get active() {
        return this.args.id === this.args.selected;
    }
}
