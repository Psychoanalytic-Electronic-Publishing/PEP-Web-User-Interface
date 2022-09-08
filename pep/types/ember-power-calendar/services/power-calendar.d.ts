import Service from '@ember/service';

declare module 'ember-power-calendar/services/power-calendar' {
    export default class PowerCalendarService extends Service {
        date: Date | null;
        locale: moment.Locale;
        getDate(): Date;
    }
}
