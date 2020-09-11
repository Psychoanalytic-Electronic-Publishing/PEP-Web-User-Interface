import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Dropdown } from 'ember-basic-dropdown/addon/components/basic-dropdown';

const KEYCODE_TAB = 9;
const KEYCODE_ENTER = 13;
const KEYCODE_ESCAPE = 27;
const KEYCODE_UP_ARROW = 38;
const KEYCODE_DOWN_ARROW = 40;

export interface FlTypeaheadSuggestion {
    id: string;
    text: string;
}

interface FlTypeaheadArgs {
    placeholder: string;
    menuClassName?: string;
    value?: string;
    suggestions?: FlTypeaheadSuggestion[];
    onChange: (currentText: string, event: HTMLElementEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (newText: string, suggestion: FlTypeaheadSuggestion) => void;
    loadSuggestions: (currentWord: string, currentText: string) => void;
}

export default class FlTypeahead extends Component<FlTypeaheadArgs> {
    inputElement: HTMLInputElement | null = null;
    suggestDebounceDelay: number = 250;

    @tracked focusedSuggestion: FlTypeaheadSuggestion | null = null;

    //TODO needs to be a restartable/cancellable concurrency task
    loadSuggestions(currentWord: string, currentText: string) {
        //TODO timeout() here
        this.args.loadSuggestions(currentWord, currentText);
    }

    @action
    onSuggestionsUpdate(dropdown: Dropdown) {
        if (this.args.suggestions?.length && !dropdown.isOpen) {
            console.log('suggestions update!');
            dropdown.actions.open();
        }
    }

    @action
    onInputInsert(element: HTMLInputElement) {
        this.inputElement = element;
    }

    @action
    onInputFocus(dropdown: Dropdown) {
        if (this.args.suggestions?.length) {
            dropdown.actions.open();
        }
    }

    @action
    onInputBlur() {
        //TODO will this cause any issues with mouse/tap based suggestion select actions? (i.e. closing the menu too early)
        // if (this.dropdown) {
        //     this.dropdown.actions.close();
        // }
        //TODO make sure dropdown always closes when it should (e.g. tapping/clicking off, tabbing away in desktop/mobile, etc)
    }

    @action
    onInputKeyDown(dropdown: Dropdown, event: HTMLElementKeyboardEvent<HTMLInputElement>) {
        // close dropdown on ESC or tabbing away
        if ([KEYCODE_ESCAPE, KEYCODE_TAB].includes(event.keyCode)) {
            return dropdown.actions.close(event, true);
        }

        // select the currently focused suggestion (if any) on ENTER
        if (event.keyCode === KEYCODE_ENTER && this.focusedSuggestion) {
            this.onSelectSuggestion(this.focusedSuggestion, dropdown);
            //TODO make sure ENTER will still submit form when no suggestion is focused (and NOT submit form when suggestion has focus!)
            return event.stopPropagation();
        }

        if ([KEYCODE_UP_ARROW, KEYCODE_DOWN_ARROW].includes(event.keyCode) && this.args.suggestions?.length) {
            //TODO handle arrow keys for suggestions navigation
        }
    }

    @action
    //@ts-ignore
    onTextChange(dropdown: Dropdown, event: HTMLElementEvent<HTMLInputElement>) {
        //TODO using the element's selection api, determine what the current "word" is
        //based on the currently selected text or cursor position
        this.args.onChange(event.target.value, event);
    }

    @action
    onSelectSuggestion(suggestion: FlTypeaheadSuggestion, dropdown: Dropdown) {
        // TODO create a new string adding the suggestion text to the existing input text
        // but in the correct position, and only the part of the current "word" that is not already entered
        const newText = 'TODO';
        this.args.onSelectSuggestion(newText, suggestion);
        dropdown.actions.close();
    }
}
