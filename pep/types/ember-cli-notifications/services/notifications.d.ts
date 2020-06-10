import Service from '@ember/service';

declare interface NotificationOptions {
    message: string;
    type: string;
    autoClear?: boolean;
    clearDuration?: number;
    onClick?(): any;
    htmlContent?: boolean;
    cssClasses?: string[];
}

declare module 'ember-cli-notifications/services/notifications' {
    export default class NotificationService extends Service {
        addNotification(options: NotificationOptions): Object;
        success(message: string, options?: NotificationOptions): Object;
        error(message: string, options?: NotificationOptions): Object;
        info(message: string, options?: NotificationOptions): Object;
        warning(message: string, options?: NotificationOptions): Object;
    }
}
