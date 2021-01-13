export const SUPPORT_URL = 'https://support.pep-web.org';
export const FORGOT_PW_URL = 'https://stage-pads.pep-web.rocks/pages/pg070Logon.aspx?Action=RequestPassword';
export const CUSTOMER_SERVICE_URL = 'http://support.pep-web.org/helptoc/customer-service/';
export const AUTHOR_INDEX_SUPPORT_URL = 'http://support.pep-web.org/helptoc/help/author-index/authorindex/';
export const SUGGEST_NEW_CONTENT_URL = 'http://support.pep-web.org/about-the-pep-archive/suggest-new-content/';

export interface SupportResource {
    label: string;
    href: string;
}

export const DATA_ERROR_SUPPORT_RESOURCES: SupportResource[] = [
    {
        label: 'reportDataError.supportResource.customerService',
        href: CUSTOMER_SERVICE_URL
    },
    {
        label: 'reportDataError.supportResource.authorIndex',
        href: AUTHOR_INDEX_SUPPORT_URL
    },
    {
        label: 'reportDataError.supportResource.newContent',
        href: SUGGEST_NEW_CONTENT_URL
    }
];
