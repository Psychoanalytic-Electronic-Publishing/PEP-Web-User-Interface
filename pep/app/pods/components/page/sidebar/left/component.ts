import { inject as service } from '@ember/service';

import { ComponentWithBoundArgs } from '@glint/environment-ember-loose';
import Component from '@glint/environment-ember-loose/glimmer-component';

import PageSidebarLeftContent from 'pep/pods/components/page/sidebar/left/content/component';
import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature, ModifyYields } from 'pep/utils/types';

interface PageSidebarLeftArgs {}

interface PageSidebarLeftYields {
    Yields: {
        default: [
            {
                content: ComponentWithBoundArgs<typeof PageSidebarLeftContent, 'data'>;
            }
        ];
    };
}

export default class PageSidebarLeft extends Component<
    ModifyYields<BaseGlimmerSignature<PageSidebarLeftArgs>, PageSidebarLeftYields>
> {
    @service sidebar!: SidebarService;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Left': typeof PageSidebarLeft;
    }
}
