import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';
import UserAgentService from 'ember-useragent/services/user-agent';

import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import ENV from 'pep/config/environment';
import FEEDBACK_TYPES, { FEEDBACK_TYPE_FEEDBACK, FeedbackType, FeedbackTypeId } from 'pep/constants/feedback-types';
import AjaxService from 'pep/services/ajax';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import { BaseGlimmerSignature } from 'pep/utils/types';
import FEEDBACK_VALIDATIONS from 'pep/validations/help/feedback';

interface Feedback {
    subject: string;
    description: string;
    url: string;
    type: string;
    browser: string;
    reporterName: string;
}

type FeedbackChangeset = GenericChangeset<Feedback>;

interface ModalDialogsHelpFeedbackArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpFeedback extends Component<BaseGlimmerSignature<ModalDialogsHelpFeedbackArgs>> {
    @service userAgent!: UserAgentService;
    @service loadingBar!: LoadingBarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service ajax!: AjaxService;
    @service currentUser!: CurrentUserService;
    validations = FEEDBACK_VALIDATIONS;
    feedbackUrl = `${ENV.reportsBaseUrl}/feedback`;
    feedbackTypes = FEEDBACK_TYPES;

    get feedbackOptions() {
        return this.feedbackTypes.map((feedbackType: FeedbackType) => ({
            ...feedbackType,
            label: this.intl.t(feedbackType.label)
        }));
    }

    @tracked changeset!: FeedbackChangeset;

    /**
     * Instantiate the FeedbackChangeset.
     * @param {unknown} owner
     * @param {ModalDialogsHelpFeedbackArgs} args
     */
    constructor(owner: unknown, args: ModalDialogsHelpFeedbackArgs) {
        super(owner, args);
        const { name, version } = this.userAgent.browser.info;
        const currentUser = this.currentUser.user;
        const feedbackChangeset = createChangeset<Feedback>(
            {
                reporterName: currentUser?.userFullName ?? '',
                subject: '',
                description: '',
                url: window.location.href,
                feedbackType: FEEDBACK_TYPE_FEEDBACK.id,
                browser: `${name} ${version}`
            },
            this.validations
        );
        this.changeset = feedbackChangeset;
    }

    /**
     * Submit the feedback form.
     *
     * @param {FeedbackChangeset} changeset
     */
    @action
    async submit(changeset: FeedbackChangeset) {
        try {
            this.loadingBar.show();
            changeset.execute();
            const requestData = { data: { attributes: changeset.data, type: 'feedbacks' } };
            const results = await this.ajax.request(this.feedbackUrl, {
                method: 'POST',
                body: this.ajax.stringifyData(requestData)
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

    /**
     * Update the changeset's `feedbackType`.
     *
     * @param {FeedbackTypeId} feedbackType
     */
    @action
    updateFeedbackType(feedbackType: FeedbackTypeId) {
        this.changeset.feedbackType = feedbackType;
    }
}
