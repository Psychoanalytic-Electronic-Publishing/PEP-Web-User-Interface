import CollapsiblePanel from 'pep/pods/components/collapsible-panel/component';
import { fadeTransition } from 'pep/utils/animation';

export default class PageDrawerNavMenu extends CollapsiblePanel {
    transition = fadeTransition;
}
