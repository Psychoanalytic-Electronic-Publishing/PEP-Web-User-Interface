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
    inputId: string = `checkboxInput-${guidFor(this)}`;

    /**
     * Invoke the checkbox's `onChange` method if it was passed in
     * as an argument
     *
     */
    @action
    onChange(event: Event) {
        if (this.args.preventDefault) {
            event.preventDefault();
        }
        if (this.args.stopPropagation) {
            event.stopPropagation();
        }
        if (this.args.onChange) {
            this.args.onChange(!this.args.checked, event);
        }
    }
}
