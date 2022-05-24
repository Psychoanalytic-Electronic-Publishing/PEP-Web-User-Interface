import Helper from '@glint/environment-ember-loose/ember-component/helper';

declare class GetArrayIndexHelper<A extends any[], N extends number> extends Helper<{
    PositionalArgs: [A, N];
    Return: A[N];
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'get-array-index': typeof GetArrayIndexHelper;
    }
}
