import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { cleanAndDasherize } from 'pep/utils/string';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface CheckboxInputArgs {
    onChange?: (newValue: boolean, event: Event) => void;
    inline?: boolean;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    name?: string;
}

export default class CheckboxInput extends Component<BaseGlimmerSignature<CheckboxInputArgs>> {
    inputId: string = `checkbox-input-${guidFor(this)}`;

    get preventDefault(): boolean {
        return this.args.preventDefault ?? false;
    }

    get stopPropagation(): boolean {
        return this.args.stopPropagation ?? false;
    }

    get name() {
        return this.args.name ?? cleanAndDasherize(this.args.label);
    }

    /**
     * Invoke the checkbox's `onChange` method if it was passed in
     * as an argument
     *
     */
    @action
    onChange(event: HTMLElementEvent<HTMLInputElement>): void {
        if (this.preventDefault) {
            event.preventDefault();
        }

        if (this.stopPropagation) {
            event.stopPropagation();
        }
        // Always get the current checked value and send it as an argument for the `onChange` event
        this.args.onChange?.(event.target.checked, event);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        CheckboxInput: typeof CheckboxInput;
    }
}
