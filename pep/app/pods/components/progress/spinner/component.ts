import Component from '@glimmer/component';

interface ProgressSpinnerArgs {
    active: boolean;
    //TODO other args
}

export default class ProgressSpinner extends Component<ProgressSpinnerArgs> {
    get active() {
        return this.args.active ?? true;
    }
}
