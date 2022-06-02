import Helper from '@ember/component/helper';

declare class PageTitleHelper extends Helper<{
    PositionalArgs: [string];
    Return: string;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'page-title': typeof PageTitleHelper;
    }
}
