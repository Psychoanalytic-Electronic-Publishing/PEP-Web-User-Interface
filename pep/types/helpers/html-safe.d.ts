import Helper from '@glint/environment-ember-loose/ember-component/helper';

import { FaIconComponent } from '../font-awesome/index';

declare class HtmlSafeHelper extends Helper<{
    PositionalArgs: [unknown];
    Return: string;
}> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'html-safe': typeof HtmlSafeHelper;
    }
}




class Test extends FaIconComponent
