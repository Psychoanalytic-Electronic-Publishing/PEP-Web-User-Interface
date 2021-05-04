import Helper from '@glint/environment-ember-loose/ember-component/helper';

declare class CurrentYearHelper extends Helper<{
    PositionalArgs: [];
    Return: number;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'current-year': typeof CurrentYearHelper;
    }
}
