import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

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

        this.args.onChange?.(!this.args.checked, event);
    }
}
