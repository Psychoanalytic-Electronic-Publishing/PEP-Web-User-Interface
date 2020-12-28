import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import createChangeset, { ModelChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import CurrentUserService from 'pep/services/current-user';
import REPORT_DATA_ERROR_VALIDATIONS from 'pep/validations/help/report-data-error';
import AjaxService from 'pep/services/ajax';
import LoadingBarService from 'pep/services/loading-bar';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

interface ErrorReport {
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

type ErrorReportChangeset = ModelChangeset<ErrorReport>;

interface ModalDialogsHelpReportDataErrorArgs {}

export default class ModalDialogsHelpReportDataError extends Component<ModalDialogsHelpReportDataErrorArgs> {
    @service ajax!: AjaxService;
    @service currentUser!: CurrentUserService;
    @service loadingBar!: LoadingBarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    validations = REPORT_DATA_ERROR_VALIDATIONS;

    @tracked changeset!: ErrorReportChangeset;

    /**
     * Instantiate the error report changeset.
     * @param {unknown} owner
     * @param {ModalDialogsHelpReportDataErrorArgs} args
     */
    constructor(owner: unknown, args: ModalDialogsHelpReportDataErrorArgs) {
        super(owner, args);
        const currentUser = this.currentUser.user;
        const errorChangeset = createChangeset<ErrorReport>(
            {
                username: currentUser?.userName ?? '',
                fullName: currentUser?.userFullName ?? '',
                email: currentUser?.emailAddress ?? '',
                problemText: '',
                correctedText: '',
                problemUrl: window.location.href,
                explanation: '',
                authorOrPublisher: false,
                originalCopy: false
            },
            this.validations
        );
        this.changeset = errorChangeset;
    }

    /**
     * Submit the error report.
     *
     * @param {ErrorReportChangeset} changeset
     */
    @action
    submit(changeset: ErrorReportChangeset) {
        try {
            this.loadingBar.show();
            // TODO: Call endpoint
            this.loadingBar.hide();
            this.notifications.success(this.intl.t('reportDataError.reportSuccessful'));
        } catch (errors) {
            this.loadingBar.hide();
            this.notifications.error(errors);
        }
    }

    /**
     * Update the boolean property indicated by the `propKey`
     * to the `newValue`.
     *
     * @param {('authorOrPublisher' | 'originalCopy')} propKey
     * @param {boolean} newValue
     */
    @action
    updateBoolean(propKey: 'authorOrPublisher' | 'originalCopy', newValue: boolean) {
        this.changeset[propKey] = newValue;
    }
}
