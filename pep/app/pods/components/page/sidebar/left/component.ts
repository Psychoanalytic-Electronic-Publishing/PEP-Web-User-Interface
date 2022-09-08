import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { ComponentWithBoundArgs } from '@glint/environment-ember-loose';

import PageSidebarLeftContent from 'pep/pods/components/page/sidebar/left/content/component';
import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature, ModifyBlocks } from 'pep/utils/types';

interface PageSidebarLeftArgs {}

interface PageSidebarLeftBlocks {
    Blocks: {
        default: [
            {
                content: ComponentWithBoundArgs<typeof PageSidebarLeftContent, 'data'>;
            }
        ];
    };
}

export default class PageSidebarLeft extends Component<
    ModifyBlocks<BaseGlimmerSignature<PageSidebarLeftArgs>, PageSidebarLeftBlocks>
> {
    @service sidebar!: SidebarService;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Left': typeof PageSidebarLeft;
    }
}
