import Component from '@glimmer/component';

interface TabsPanelArgs {
    id: string;
    selected: string;
}

export default class TabsPanel extends Component<TabsPanelArgs> {
    get active() {
        return this.args.id === this.args.selected;
    }
}
