import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

import xss from 'xss';

interface InformationBarBarsAdminMessageArgs {
    close: () => void;
}
export default class InformationBarBarsAdminMessage extends Component<
    BaseGlimmerSignature<InformationBarBarsAdminMessageArgs>
> {
    @service declare configuration: ConfigurationService;

    get message() {
        const m = this.configuration.content.global.notificationMessage
            ? this.configuration.content.global.notificationMessage
            : this.configuration.base.global.notificationMessage;

        return xss(m || '');
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'InformationBar::Bars::AdminMessage': typeof InformationBarBarsAdminMessage;
    }
}
