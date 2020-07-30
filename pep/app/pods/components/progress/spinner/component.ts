import Component from '@glimmer/component';

interface ProgressSpinnerArgs {
    active: boolean;
    light?: boolean;
    size?: string;
}

export default class ProgressSpinner extends Component<ProgressSpinnerArgs> {
    get active() {
        return this.args.active ?? true;
    }
}
