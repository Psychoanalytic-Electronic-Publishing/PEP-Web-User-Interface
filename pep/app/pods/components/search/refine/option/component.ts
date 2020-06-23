import Component from '@glimmer/component';

interface SearchRefineOptionArgs {
    //TODO
}

export default class SearchRefineOption extends Component<SearchRefineOptionArgs> {
    get isChecked() {
        return !!this.args.selection.find(
            (facet) => facet.id === this.args.facetId && facet.value === this.args.option.id
        );
    }
}
