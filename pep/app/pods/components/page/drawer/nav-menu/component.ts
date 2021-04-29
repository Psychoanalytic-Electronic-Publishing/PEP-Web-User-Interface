import CollapsiblePanel from 'pep/pods/components/collapsible-panel/component';
import { fadeTransition } from 'pep/utils/animation';

export default class PageDrawerNavMenu extends CollapsiblePanel {
    transition = fadeTransition;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Drawer::NavMenu': typeof PageDrawerNavMenu;
    }
}
