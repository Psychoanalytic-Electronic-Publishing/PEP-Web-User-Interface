import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

import { IconName } from '@fortawesome/fontawesome-svg-core';

interface BrowseTabArgs {
    filter: string;
    count: number;
    icon: IconName;
}

export default class BrowseTab extends Component<BaseGlimmerSignature<BrowseTabArgs>> {}
