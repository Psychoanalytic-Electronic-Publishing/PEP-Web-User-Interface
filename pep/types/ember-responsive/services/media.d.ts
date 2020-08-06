import Service from '@ember/service';

declare module 'ember-responsive/services/media' {
    export default class MediaService extends Service {
        isMobile: boolean;
        isTablet: boolean;
        isDesktop: boolean;
        on(event: string, target: any, method: Function): void;
        off(event: string, target: any, method: Function): void;
    }
}
