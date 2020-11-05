import Component from '@glimmer/component';

interface TabsPanelArgs {
    tabId: string;
    selected: string;
}

export default class TabsPanel extends Component<TabsPanelArgs> {
    get active() {
        return this.args.tabId === this.args.selected;
    }
}
