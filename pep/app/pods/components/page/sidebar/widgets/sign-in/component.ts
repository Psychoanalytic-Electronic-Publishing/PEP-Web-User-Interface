import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ConfigurationService from 'pep/services/configuration';

export default class PageSidebarWidgetsSignIn extends Component {
    @service configuration!: ConfigurationService;

    get cardInfo() {
        return this.configuration.content.global.signInCard;
    }
}
