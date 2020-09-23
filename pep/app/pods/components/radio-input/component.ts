import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

interface RadioInputArgs {
    onChange?: (newValue: boolean, event: Event) => void;
    value: any;
    inline?: boolean;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

export default class RadioInput extends Component<RadioInputArgs> {
    inputId: string = `radio-input-${guidFor(this)}`;

    /**
     * Invoke the radio's `onChange` method if it was passed in
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
            this.args.onChange(this.args.value, event);
        }
    }
}
