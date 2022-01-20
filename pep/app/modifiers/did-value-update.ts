import Modifier from 'ember-modifier';

/**
 * Modifier to compare the current value against the previous value. If it has changed, we call the passed in function
 *
 * @export
 * @class DidValueUpdateModifier
 * @extends {Modifier}
 */
export default class DidValueUpdateModifier extends Modifier {
    previousValue: any = null;

    didReceiveArguments() {
        if (this.previousValue !== this.args.positional[1] && this.args.positional[0]) {
            this.previousValue = this.args.positional[1];
            // eslint-disable-next-line @typescript-eslint/ban-types
            (this.args.positional[0] as Function)();
        }
    }
}
