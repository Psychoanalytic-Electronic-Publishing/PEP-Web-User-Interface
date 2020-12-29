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
    urlProblemPage: string;
    additionalInfo: string;
    isAuthorPublisher: boolean;
    hasOriginalCopy: boolean;
}

interface CommonResource {
    label: string;
    href: string;
}

type ErrorReportChangeset = ModelChangeset<ErrorReport>;

interface ModalDialogsHelpReportDataErrorArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpReportDataError extends Component<ModalDialogsHelpReportDataErrorArgs> {
    @service ajax!: AjaxService;
    @service currentUser!: CurrentUserService;
    @service loadingBar!: LoadingBarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    validations = REPORT_DATA_ERROR_VALIDATIONS;

    commonResources: CommonResource[] = [
        {
            label: 'Access problems or general support',
            href: 'http://support.pep-web.org/helptoc/customer-service/'
        },
        {
            label: 'Author index correction',
            href: 'http://support.pep-web.org/helptoc/help/author-index/authorindex/'
        },
        {
            label: 'New content suggestion',
            href: 'http://support.pep-web.org/about-the-pep-archive/suggest-new-content/'
        }
    ];

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
                urlProblemPage: window.location.href,
                additionalInfo: '',
                isAuthorPublisher: false,
                hasOriginalCopy: false
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
    async submit(changeset: ErrorReportChangeset) {
        try {
            this.loadingBar.show();
            changeset.execute();
            const results = await this.ajax.request('', {
                method: 'POST',
                body: this.ajax.stringifyData(changeset.data)
            });
            this.loadingBar.hide();
            this.notifications.success(this.intl.t('reportDataError.reportSuccessful'));
            this.args.onClose();
            return results;
        } catch (errors) {
            this.loadingBar.hide();
            this.notifications.error(errors);
        }
    }

    /**
     * Update the boolean property indicated by the `propKey`
     * to the `newValue`.
     *
     * @param {('isAuthorPublisher' | 'hasOriginalCopy')} propKey
     * @param {boolean} newValue
     */
    @action
    updateBoolean(propKey: 'isAuthorPublisher' | 'hasOriginalCopy', newValue: boolean) {
        this.changeset[propKey] = newValue;
    }
}
