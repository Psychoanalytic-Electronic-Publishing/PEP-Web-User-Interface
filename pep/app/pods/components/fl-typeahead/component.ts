import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export interface FlTypeaheadSuggestion {
    text: string;
}

interface FlTypeaheadArgs {
    placeholder: string;
    value?: string;
    suggestions?: FlTypeaheadSuggestion[];
    onChange: (currentText: string, event: HTMLElementEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (newText: string, suggestion: FlTypeaheadSuggestion) => void;
    loadSuggestions: (currentText: string, currentWord: string) => void;
}

export default class FlTypeahead extends Component<FlTypeaheadArgs> {
    inputElement: HTMLInputElement | null = null;
    suggestDebounceDelay: number = 250;

    @tracked focusedSuggestion: FlTypeaheadSuggestion | null = null;

    //TODO needs to be a restartable/cancellable concurrency task
    loadSuggestions(currentText: string, currentWord: string) {
        //TODO timeout() here
        this.args.loadSuggestions(currentText, currentWord);
    }

    @action
    onInputInsert(element: HTMLInputElement) {
        this.inputElement = element;
    }

    @action
    onInputKeyDown(event: HTMLElementKeyboardEvent<HTMLInputElement>) {
        //@ts-ignore
        console.log('KEYDOWN', event.keyCode);
        //TODO handle arrow keys/etc for suggestions navigation
    }

    @action
    onTextChange(event: HTMLElementEvent<HTMLInputElement>) {
        //TODO using the element's selection api, determine what the current "word" is
        //based on the currently selected text or cursor position
        this.args.onChange(event.target.value, event);
    }
}
