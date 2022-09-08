import Helper from '@ember/component/helper';

declare class EmbargoYearHelper extends Helper<{
    PositionalArgs: [Date, string | undefined];
    Return: string;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'embargo-year': typeof EmbargoYearHelper;
    }
}
