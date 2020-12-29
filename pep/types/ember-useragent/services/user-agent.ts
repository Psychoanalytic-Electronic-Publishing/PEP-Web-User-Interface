import Service from '@ember/service';

declare module 'ember-useragent/services/user-agent' {
    export default class UserAgentService extends Service {
        device: {
            isMobile: boolean;
            isTablet: boolean;
            isDesktop: boolean;
        };
        browser: {
            info: BrowserInfo;
        };
    }

    export interface BrowserInfo {
        name: string;
        major: string;
        version: string;
    }
}
