import Component from '@glimmer/component';

interface LoadingWidgetArgs {
    options?: {
        numLines?: number;
    };
}

export default class LoadingWidget extends Component<LoadingWidgetArgs> {
    get numLines() {
        return this.args.options?.numLines ?? 3;
    }
}
