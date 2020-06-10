import Service from '@ember/service';
import Evented from '@ember/object/evented';

interface Data {
    authenticated: {
        id: string;
    };
}
declare module 'ember-intl/services/intl' {
    export default class intl extends Service.extend(Evented) {
        locale: any;
        primaryLocale: any;

        formatRelative(name: string): any;
        formatMessage(name: string): any;
        formatNumber(name: string): any;
        formatTime(name: string): any;
        formatDate(name: string): any;

        init(): VoidFunction;
        willDestroy(): VoidFunction;

        lookup(key: string, localeName: string, options: object): object;
        t(key: string, options?: object): string;
        setLocale(name: string): VoidFunction;
    }
}
