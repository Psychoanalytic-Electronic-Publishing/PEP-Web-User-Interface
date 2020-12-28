import { ModelChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import Component from '@glimmer/component';

interface Feedback {
    username: string;
    fullName: string;
    email: string;
    problemText: string;
    correctedText: string;
    problemUrl: string;
    explanation: string;
    authorOrPublisher: boolean;
    originalCopy: boolean;
}

type FeedbackChangeset = ModelChangeset<Feedback>;

interface ModalDialogsHelpFeedbackArgs {}

export default class ModalDialogsHelpFeedback extends Component<ModalDialogsHelpFeedbackArgs> {}
