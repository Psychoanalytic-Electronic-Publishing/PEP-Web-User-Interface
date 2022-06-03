import Helper from '@ember/component/helper';

declare class FormatNumberHelper extends Helper<{
    PositionalArgs: [number];
    Return: number;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'format-number': typeof FormatNumberHelper;
    }
}
