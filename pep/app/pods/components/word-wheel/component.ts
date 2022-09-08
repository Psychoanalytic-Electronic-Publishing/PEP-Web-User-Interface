import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import DS from 'ember-data';

import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { FlTypeaheadSuggestion } from 'pep/pods/components/fl-typeahead/component';
import { BaseGlimmerSignature } from 'pep/utils/types';

export enum WordWheelSearchType {
    WORD = 'word',
    TEXT = 'text'
}
interface WordWheelArgs {
    placeholder: string;
    value?: string;
    limit?: number;
    apiField?: string;
    apiCore?: string;
    searchType?: WordWheelSearchType;
    onChange: (newText: string) => void;
}

export default class WordWheel extends Component<BaseGlimmerSignature<WordWheelArgs>> {
    @service store!: DS.Store;

    @tracked suggestions: FlTypeaheadSuggestion[] = [];

    get limit() {
        return this.args.limit ?? 8;
    }

    get apiField() {
        return this.args.apiField ?? 'text';
    }

    get apiCore() {
        return this.args.apiCore ?? 'docs';
    }

    get searchType() {
        return this.args.searchType ?? WordWheelSearchType.WORD;
    }

    /**
     * Loads word wheel suggestions for the current word in the input value
     * @param {string} currentWord
     * @returns {Promise<FlTypeaheadSuggestion[]>}
     */
    @action
    async loadSuggestions(currentWord?: string, text?: string): Promise<FlTypeaheadSuggestion[]> {
        if (currentWord?.length) {
            const params = removeEmptyQueryParams({
                word: this.searchType === WordWheelSearchType.WORD ? currentWord : text,
                field: this.apiField,
                core: this.apiCore,
                limit: this.limit,
                offset: 0
            });
            const result = await this.store.query('word-wheel', params);
            const models = result.toArray();
            this.suggestions = models.map((model) => ({ id: model.id, text: model.term }));
        } else {
            this.suggestions = [];
        }

        return this.suggestions;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        WordWheel: typeof WordWheel;
    }
}
