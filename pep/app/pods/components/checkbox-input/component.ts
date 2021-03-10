import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';

interface CheckboxInputArgs {
    onChange?: (newValue: boolean, event: Event) => void;
    inline?: boolean;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

export default class CheckboxInput extends Component<CheckboxInputArgs> {
    inputId: string = `checkbox-input-${guidFor(this)}`;

    get preventDefault() {
        return this.args.preventDefault ?? false;
    }

    get stopPropagation() {
        return this.args.stopPropagation ?? false;
    }

    /**
     * Invoke the checkbox's `onChange` method if it was passed in
     * as an argument
     *
     */
    @action
    onChange(event: Event) {
        if (this.preventDefault) {
            event.preventDefault();
        }

        if (this.stopPropagation) {
            event.stopPropagation();
        }
        // Always get the current checked value and send it as an argument for the `onChange` event
        const target = event.target as HTMLInputElement;
        this.args.onChange?.(target.checked, event);
    }
}
