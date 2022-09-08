import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface TabsTabArgs {
    id: string;
    selected: string;
}

export default class TabsTab extends Component<BaseGlimmerSignature<TabsTabArgs>> {
    get isActive() {
        return this.args.id === this.args.selected;
    }
}
