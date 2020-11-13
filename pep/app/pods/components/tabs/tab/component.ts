import Component from '@glimmer/component';

interface TabsTabArgs {
    id: string;
    selected: string;
}

export default class TabsTab extends Component<TabsTabArgs> {
    get isActive() {
        return this.args.id === this.args.selected;
    }
}
