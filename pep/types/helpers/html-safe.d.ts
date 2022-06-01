import Helper from '@ember/component/helper';

declare class HtmlSafeHelper extends Helper<{
    PositionalArgs: [unknown];
    Return: string;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'html-safe': typeof HtmlSafeHelper;
    }
}
