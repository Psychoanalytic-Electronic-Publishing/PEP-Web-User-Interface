import Component from '@glimmer/component';
import { WidgetData } from 'pep/constants/sidebar';

interface PageSidebarLeftArgs {
    data: WidgetData;
}

export default class PageSidebarLeft extends Component<PageSidebarLeftArgs> {}
