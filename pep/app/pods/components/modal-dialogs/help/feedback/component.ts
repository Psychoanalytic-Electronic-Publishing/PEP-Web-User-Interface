import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';
import UserAgentService from 'ember-useragent/services/user-agent';
import AjaxService from 'pep/services/ajax';
import LoadingBarService from 'pep/services/loading-bar';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import createChangeset, { ModelChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Feedback {
    subject: string;
    description: string;
    url: string;
    type: string;
    browser: string;
}

type FeedbackChangeset = ModelChangeset<Feedback>;

interface ModalDialogsHelpFeedbackArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpFeedback extends Component<ModalDialogsHelpFeedbackArgs> {
    @service userAgent!: UserAgentService;
    @service loadingBar!: LoadingBarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service ajax!: AjaxService;

    @tracked changeset!: FeedbackChangeset;

    constructor(owner: unknown, args: ModalDialogsHelpFeedbackArgs) {
        super(owner, args);
        const feedbackChangeset = createChangeset<Feedback>(
            {
                subject: '',
                description: '',
                url: window.location.href,
                type: '',
                browser: this.userAgent.browser.info
            },
            {}
        );
        this.changeset = feedbackChangeset;
    }

    @action
    submit(changeset: FeedbackChangeset) {
        try {
            this.loadingBar.show();
            changeset.execute();
            const results = this.ajax.request('', {
                method: 'POST',
                body: this.ajax.stringifyData(changeset.data)
            });
            this.notifications.success(this.intl.t('feedback.feedbackSuccessful'));
            this.loadingBar.hide();
            this.args.onClose();
            return results;
        } catch (errors) {
            this.loadingBar.hide();
            this.notifications.error(errors);
            throw errors;
        }
    }
}
