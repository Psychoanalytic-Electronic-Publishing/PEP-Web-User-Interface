import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

import { FlTypeaheadSuggestion } from 'pep/pods/components/fl-typeahead/component';

interface WordWheelArgs {
    placeholder: string;
    value?: string;
    limit?: number;
    apiField?: string;
    apiCore?: string;
}

export default class WordWheel extends Component<WordWheelArgs> {
    @service store!: DS.Store;

    @tracked suggestions: FlTypeaheadSuggestion[];

    get limit() {
        return this.args.limit ?? 8;
    }

    get apiField() {
        return this.args.apiField ?? 'text';
    }

    get apiCore() {
        return this.args.apiField ?? 'docs';
    }

    /**
     * Default the suggestions to an empty list on render
     * @param {unknown} owner
     * @param {WordWheelArgs} args
     */
    constructor(owner: unknown, args: WordWheelArgs) {
        super(owner, args);
        this.suggestions = [];
    }

    @action
    loadSuggestions(currentText: string, currentWord: string) {
        console.log(currentText, currentWord);
    }
}
