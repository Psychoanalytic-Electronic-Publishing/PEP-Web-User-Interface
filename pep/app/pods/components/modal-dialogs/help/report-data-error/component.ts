import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import ENV from 'pep/config/environment';
import { DATA_ERROR_SUPPORT_RESOURCES, SupportResource } from 'pep/constants/urls';
import AjaxService from 'pep/services/ajax';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import { BaseGlimmerSignature } from 'pep/utils/types';
import REPORT_DATA_ERROR_VALIDATIONS from 'pep/validations/help/report-data-error';

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

type ErrorReportChangeset = GenericChangeset<ErrorReport>;

interface ModalDialogsHelpReportDataErrorArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpReportDataError extends Component<
    BaseGlimmerSignature<ModalDialogsHelpReportDataErrorArgs>
> {
    @service ajax!: AjaxService;
    @service currentUser!: CurrentUserService;
    @service loadingBar!: LoadingBarService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    validations = REPORT_DATA_ERROR_VALIDATIONS;
    supportResources: SupportResource[] = DATA_ERROR_SUPPORT_RESOURCES.map((supportResource: SupportResource) => ({
        ...supportResource,
        label: this.intl.t(supportResource.label)
    }));
    dataErrorUrl = `${ENV.reportsBaseUrl}/data-errors`;

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
            const requestData = { data: { attributes: changeset.data, type: 'dataErrors' } };
            const results = await this.ajax.request(this.dataErrorUrl, {
                method: 'POST',
                body: this.ajax.stringifyData(requestData)
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
