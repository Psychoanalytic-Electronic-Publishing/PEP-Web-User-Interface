import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ConfigurationService from 'pep/services/configuration';
import { inject } from '@ember/service';
interface PageSidebarLeftContentArgs {}

export default class PageSidebarLeftContent extends Component<PageSidebarLeftContentArgs> {
    @inject configuration!: ConfigurationService;
    @tracked leftSidebarWidgets = this.configuration.base.global.cards.left;
}
