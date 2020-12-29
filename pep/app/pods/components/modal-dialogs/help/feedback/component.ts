import { ModelChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import UserAgentService from 'ember-useragent/services/user-agent';

interface Feedback {
    subject: string;
    description: string;
    url: string;
    type: string;
    browser: string;
}

type FeedbackChangeset = ModelChangeset<Feedback>;

interface ModalDialogsHelpFeedbackArgs {}

export default class ModalDialogsHelpFeedback extends Component<ModalDialogsHelpFeedbackArgs> {
    @service userAgent!: UserAgentService;
}
