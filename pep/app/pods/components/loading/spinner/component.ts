import Component from '@glimmer/component';

interface LoadingSpinnerArgs {
    options: {
        text?: string;
    };
}

export default class LoadingSpinner extends Component<LoadingSpinnerArgs> {}
