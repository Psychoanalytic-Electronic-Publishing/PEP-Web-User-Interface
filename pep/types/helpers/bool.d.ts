import Helper from '@ember/component/helper';

declare class BoolHelper extends Helper<{
    PositionalArgs: [unknown];
    Return: boolean;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        bool: typeof BoolHelper;
    }
}
