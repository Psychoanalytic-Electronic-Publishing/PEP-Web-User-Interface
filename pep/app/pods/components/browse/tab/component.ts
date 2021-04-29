import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface BrowseTabArgs {
    filter: string;
    count: number;
    icon: string;
}

export default class BrowseTab extends Component<BaseGlimmerSignature<BrowseTabArgs>> {}
