import Helper from '@glint/environment-ember-loose/ember-component/helper';

declare class TranslationHelper extends Helper<{
    PositionalArgs: [unknown];
    NamedArgs: {
        [key: string]: any;
        htmlSafe?: boolean;
    };
    Return: string;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        t: typeof TranslationHelper;
    }
}
