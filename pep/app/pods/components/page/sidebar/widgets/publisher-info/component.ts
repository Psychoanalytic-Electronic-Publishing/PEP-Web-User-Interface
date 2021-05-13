import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import Modal from '@gavant/ember-modals/services/modal';

import { WIDGET } from 'pep/constants/sidebar';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature, guard } from 'pep/utils/types';

interface PageSidebarWidgetsPublisherInfoArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsPublisherInfo extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsPublisherInfoArgs>
> {
    @service configuration!: ConfigurationService;
    @service modal!: Modal;

    get data(): Document | Document['PEPCode'] {
        return this.args.data[this.widget];
    }

    get publisherInformation() {
        const code = guard<Document>(this.data, 'PEPCode') ? this.data.PEPCode : this.data;
        return this.configuration.content.global.publishers.find((publisher) => publisher.sourceCode === code);
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.PUBLISHER_INFO;

    /**
     * Open modal for subscribing to emails
     *
     * @memberof PageSidebarWidgetsWhatsNew
     */
    @action
    openModal() {
        this.modal.open('publisher-info', {
            model: this.publisherInformation
        });
    }
}
