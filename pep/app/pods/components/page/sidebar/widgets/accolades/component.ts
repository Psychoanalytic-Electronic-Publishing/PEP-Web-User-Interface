import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ConfigurationService from 'pep/services/configuration';

interface PageSidebarWidgetsAccoladesArgs {}

export default class PageSidebarWidgetsAccolades extends Component<PageSidebarWidgetsAccoladesArgs> {
    @service configuration!: ConfigurationService;
}
