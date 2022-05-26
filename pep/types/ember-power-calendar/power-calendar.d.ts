import Component from '@glimmer/component';

import PowerCalendarDays, { CalendarDay } from 'ember-power-calendar/power-calendar/days';
import PowerCalendarNav from 'ember-power-calendar/power-calendar/nav';

import { WithBoundArgs } from '@glint/template';

export interface PowerCalendarDayValue {
    date: Date;
    datetime: moment.Moment;
}

export interface PowerCalendarRangeValue {
    start?: Date;
    end?: Date;
}

export interface PowerCalendarAPI {
    uniqueId: string;
    selected?: Date | moment.Moment;
    loading?: boolean;
    center?: Date | moment.Moment;
    locale: string;
    type: 'multiple' | 'range' | 'single';
    actions: {
        changeCenter(newCenter: Date, calendar: PowerCalendarAPI, event: Event): unknown;
        moveCenter(step: number, unit: string, calendar: PowerCalendarAPI, event: Event): unknown;
        select(day: Date, calendar?: PowerCalendarAPI, event?: Event): unknown;
    };
}

export interface PowerCalendarArgs {
    center?: Date | moment.Moment;
    selected?: Date | moment.Moment;
    onCenterChange?(newCenter: PowerCalendarDayValue, calendar?: PowerCalendarAPI, event?: Event): any;
    onSelect?(day: CalendarDay): any;
    minRange?: string | number | moment.Moment;
    maxRange?: string | number | moment.Moment;
    proximitySelection?: boolean;
    locale?: string;
    navComponent?: string;
    daysComponent?: string;
    onInit?(calendar: PowerCalendarAPI): void;
}

export interface PowerCalendarYield extends PowerCalendarAPI {
    Nav: WithBoundArgs<typeof PowerCalendarNav, 'calendar'>;
    Days: WithBoundArgs<typeof PowerCalendarDays, 'calendar'>;
}

export interface PowerCalendarSignature {
    Args: PowerCalendarArgs;
    Blocks: {
        default?: [PowerCalendarYield];
    };
    Element: HTMLDivElement;
}

export default class PowerCalendar extends Component<PowerCalendarSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        PowerCalendar: typeof PowerCalendar;
    }
}
