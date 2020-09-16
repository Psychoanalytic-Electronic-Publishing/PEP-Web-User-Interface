import Component from '@glimmer/component';
import { WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import { inject as service } from '@ember/service';
import ConfigurationService from 'pep/services/configuration';
import { action } from '@ember/object';
import Modal from '@gavant/ember-modals/services/modal';

interface PageSidebarWidgetsPublisherInfoArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsPublisherInfo extends Component<PageSidebarWidgetsPublisherInfoArgs> {
    @service configuration!: ConfigurationService;
    @service modal!: Modal;

    get data(): Document {
        return this.args.data[this.widget];
    }

    get publisherInformation() {
        const code = this.data.PEPCode;
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
