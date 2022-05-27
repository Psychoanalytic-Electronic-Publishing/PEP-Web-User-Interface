import { action } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { BasicDropdownAPI as Dropdown } from 'ember-basic-dropdown/dropdown';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { getCaretPosition } from 'pep/utils/dom';
import { BaseGlimmerSignature } from 'pep/utils/types';

const KEYCODE_TAB = 9;
const KEYCODE_ENTER = 13;
const KEYCODE_ESCAPE = 27;
const KEYCODE_UP_ARROW = 38;
const KEYCODE_DOWN_ARROW = 40;
const NOT_WHITESPACE_RE = /[^\s]/;

export interface FlTypeaheadSuggestion {
    id: string;
    text: string;
}

interface WordSelection {
    word: string;
    startIndex: number;
    endIndex: number;
}

interface FlTypeaheadArgs {
    placeholder: string;
    menuClassName?: string;
    value?: string;
    suggestions?: FlTypeaheadSuggestion[];
    onChange: (currentText: string, event: HTMLElementEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (newText: string, suggestion: FlTypeaheadSuggestion) => void;
    loadSuggestions: (currentWord: string, currentText: string) => Promise<FlTypeaheadSuggestion[]>;
}

export default class FlTypeahead extends Component<BaseGlimmerSignature<FlTypeaheadArgs>> {
    inputElement?: HTMLInputElement;
    lastCaretPosition: number = 0;
    suggestDebounceDelay: number = 250;

    @tracked focusedSuggestion: FlTypeaheadSuggestion | null = null;

    /**
     * Updates the user's search form preferences after a short delay
     * @param {string} currentText
     * @param {Dropdown} dropdown
     */
    @restartableTask
    *loadSuggestions(currentText: string, dropdown: Dropdown) {
        yield timeout(this.suggestDebounceDelay);
        const caretPos = this.inputElement ? getCaretPosition(this.inputElement) : null;
        const currentWord = this.getCurrentWordFromCaret(currentText, caretPos);
        const suggestions: FlTypeaheadSuggestion[] = yield this.args.loadSuggestions(currentWord.word, currentText);
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
        this.lastCaretPosition = getCaretPosition(event.target);

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
            return event.preventDefault();
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
        this.args.onChange(currentText, event);
        taskFor(this.loadSuggestions).perform(currentText, dropdown);
    }

    /**
     * Inserts the selected suggestion into the current input value
     * @param {FlTypeaheadSuggestion} suggestion
     * @param {Dropdown} dropdown
     * @param {HTMLElementEvent<HTMLButtonElement>} event
     */
    @action
    onSelectSuggestion(suggestion: FlTypeaheadSuggestion, dropdown: Dropdown, event?: MouseEvent) {
        // insert only the missing portion of the selected suggestion
        // and insert it only for the "current word" relative to the caret position
        // in case their are multiple instances of the word and/or the caret is in
        // the middle of the current text value
        const currentText = this.args.value ?? '';
        const currentWord = this.getCurrentWordFromCaret(currentText, this.lastCaretPosition);
        const wordRegex = new RegExp(`^${currentWord.word}`, 'i');
        const insertText = suggestion.text.replace(wordRegex, '');
        const insertStart = currentWord.startIndex + currentWord.word.length;
        const newText = currentText.substring(0, insertStart) + insertText + currentText.substring(insertStart);
        // move the caret to right after the inserted suggestion
        const newCaretPos = currentWord.endIndex + insertText.length;
        this.focusedSuggestion = null;
        this.args.onSelectSuggestion(newText, suggestion);
        // clear the current suggestions and close the dropdown
        this.args.loadSuggestions('', this.args.value ?? '');
        dropdown.actions.close(event, true);
        next(this, () => this.refocusInput(newCaretPos));
        if (event) {
            event.preventDefault();
        }
    }

    /**
     * Focuses the input and optionally sets the text caret position
     * @param {number} newCaretPos
     */
    refocusInput(newCaretPos?: number) {
        if (this.inputElement) {
            if (newCaretPos) {
                // blur() here is needed to reset the input's "panned" position
                // so that the new selection position will be in-view if the value
                // extends beyond the input's width
                // TODO - this works in Chrome/Firefox, however seems to not be fully working in Safari
                this.inputElement.blur();
                this.inputElement.selectionStart = newCaretPos;
                this.inputElement.selectionEnd = newCaretPos;
            }

            this.inputElement.focus();
        }
    }

    /**
     * If the input has a current selection/caret position,
     * returns the current word relative to that position.
     * Otherwise, returns the entire input value
     * @param {string} value
     * @returns {string}
     */
    getCurrentWordFromCaret(value: string, caretPosition: number | null = null): WordSelection {
        let word = value;
        let startIndex = 0;
        let endIndex = value.length - 1;
        if (caretPosition !== null) {
            word = '';
            let prevCharPos = caretPosition - 1;
            let nextCharPos = caretPosition;
            startIndex = caretPosition;
            endIndex = nextCharPos;
            // starting at the caret position, traverses backward and forward through the string
            // prepending and appending characters until a whitespace character or the beginning
            // or end of the string is reached (but allows traversal in the other direction to
            // continue until it also reaches whitespace or beginning/end of the string).
            while (prevCharPos >= 0 || nextCharPos <= value.length - 1) {
                if (prevCharPos >= 0) {
                    const char = value.charAt(prevCharPos);
                    if (NOT_WHITESPACE_RE.test(char)) {
                        word = `${char}${word}`;
                        startIndex = prevCharPos;
                        prevCharPos--;
                    } else {
                        prevCharPos = -1;
                    }
                }

                if (nextCharPos <= value.length - 1) {
                    const char = value.charAt(nextCharPos);
                    if (NOT_WHITESPACE_RE.test(char)) {
                        word = `${word}${char}`;
                        nextCharPos++;
                        endIndex = nextCharPos;
                    } else {
                        nextCharPos = value.length;
                    }
                }
            }
        }

        return { word, startIndex, endIndex };
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        FlTypeahead: typeof FlTypeahead;
    }
}
