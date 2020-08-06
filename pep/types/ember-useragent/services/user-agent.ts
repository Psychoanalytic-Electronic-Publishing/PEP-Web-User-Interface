import Service from '@ember/service';

declare module 'ember-useragent/services/user-agent' {
    export default class UserAgentService extends Service {
        device: {
            isMobile: boolean;
            isTablet: boolean;
            isDesktop: boolean;
        };
    }
}
