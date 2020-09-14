import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { Dropdown } from 'ember-basic-dropdown/addon/components/basic-dropdown';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

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
    value: string;
    suggestions?: FlTypeaheadSuggestion[];
    onChange: (currentText: string, event: HTMLElementEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (newText: string, suggestion: FlTypeaheadSuggestion) => void;
    loadSuggestions: (currentWord: string, currentText: string) => Promise<FlTypeaheadSuggestion[]>;
}

export default class FlTypeahead extends Component<FlTypeaheadArgs> {
    inputElement: HTMLInputElement | null = null;
    suggestDebounceDelay: number = 250;

    @tracked focusedSuggestion: FlTypeaheadSuggestion | null = null;

    /**
     * Updates the user's search form preferences after a short delay
     */
    @restartableTask
    *loadSuggestions(currentWord: string, currentText: string, dropdown: Dropdown) {
        yield timeout(this.suggestDebounceDelay);
        const suggestions: FlTypeaheadSuggestion[] = yield this.args.loadSuggestions(currentWord, currentText);
        if (suggestions.length > 0) {
            dropdown.actions.open();
        } else {
            dropdown.actions.close();
        }
    }

    /**
     * Save a ref to the input element on initial render
     * @param {HTMLInputElement} element
     */
    @action
    onInputInsert(element: HTMLInputElement) {
        this.inputElement = element;
    }

    /**
     * When the input is focused, open the suggestions dropdown if there is any suggestions
     * @param {Dropdown} dropdown
     */
    @action
    onInputFocus(dropdown: Dropdown) {
        if (this.args.suggestions?.length) {
            dropdown.actions.open();
        }
    }

    /**
     * Handles keyboard navigation and interaction with the suggestions dropdown/options
     * @param {Dropdown} dropdown
     * @param {HTMLElementKeyboardEvent<HTMLInputElement>} event
     */
    @action
    onInputKeyDown(dropdown: Dropdown, event: HTMLElementKeyboardEvent<HTMLInputElement>) {
        // close dropdown on ESC or tabbing away
        if ([KEYCODE_ESCAPE, KEYCODE_TAB].includes(event.keyCode)) {
            return dropdown.actions.close(event, true);
        }

        // select the currently focused suggestion (if any) on ENTER
        if (event.keyCode === KEYCODE_ENTER && this.focusedSuggestion) {
            this.onSelectSuggestion(this.focusedSuggestion, dropdown);
            return event.preventDefault();
        }

        // navigate between suggestions with up/down arrow keys
        if ([KEYCODE_UP_ARROW, KEYCODE_DOWN_ARROW].includes(event.keyCode) && this.args.suggestions?.length) {
            const curIndex = this.focusedSuggestion ? this.args.suggestions.indexOf(this.focusedSuggestion) : -1;
            let newIndex = 0;
            if (event.keyCode === KEYCODE_UP_ARROW) {
                newIndex = curIndex <= 0 ? this.args.suggestions.length - 1 : curIndex - 1;
            } else {
                newIndex = curIndex >= this.args.suggestions.length - 1 ? 0 : curIndex + 1;
            }

            this.focusedSuggestion = this.args.suggestions[newIndex];
            event.preventDefault();
        }
    }

    /**
     * When the input's text changes, updates the bound `@value` and sends an action
     * to load suggestions for the current "word" in the value
     * @param {Dropdown} dropdown
     * @param {HTMLElementEvent<HTMLInputElement>} event
     */
    @action
    onTextChange(dropdown: Dropdown, event: HTMLElementEvent<HTMLInputElement>) {
        const currentText = event.target.value;
        //TODO using the element's selection api, determine what the current "word" is
        //based on the currently selected text or cursor position
        const currentWord = currentText;

        this.args.onChange(currentText, event);
        taskFor(this.loadSuggestions).perform(currentWord, currentText, dropdown);
    }

    /**
     * Inserts the selected suggestion into the current input value
     * @param {FlTypeaheadSuggestion} suggestion
     * @param {Dropdown} dropdown
     * @param {HTMLElementEvent<HTMLButtonElement>} event
     */
    @action
    onSelectSuggestion(
        suggestion: FlTypeaheadSuggestion,
        dropdown: Dropdown,
        event?: HTMLElementEvent<HTMLButtonElement>
    ) {
        // TODO create a new string adding the suggestion text to the existing input text
        // but in the correct position, and only the part of the current "word" that is not already entered
        const newText = 'TODO';
        this.focusedSuggestion = suggestion;
        this.args.onSelectSuggestion(newText, suggestion);
        // clear the current suggestions and close the dropdown
        this.args.loadSuggestions('', this.args.value);
        dropdown.actions.close(event, true);
        if (event) {
            // TODO maintain last cursor position on refocus
            next(this, () => this.inputElement?.focus());
            event.preventDefault();
        }
    }
}
