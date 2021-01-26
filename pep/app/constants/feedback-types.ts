export interface FeedbackType {
    id: FeedbackTypeId;
    label: string;
}

export enum FeedbackTypeId {
    FEEDBACK = 'FEEDBACK',
    ISSUE = 'ISSUE'
}

export const FEEDBACK_TYPE_FEEDBACK: FeedbackType = {
    id: FeedbackTypeId.FEEDBACK,
    label: 'feedback.feedbackTypes.feedback'
};

export const FEEDBACK_TYPE_ISSUE: FeedbackType = {
    id: FeedbackTypeId.ISSUE,
    label: 'feedback.feedbackTypes.issue'
};

const FEEDBACK_TYPES = [FEEDBACK_TYPE_FEEDBACK, FEEDBACK_TYPE_ISSUE];

export default FEEDBACK_TYPES;
