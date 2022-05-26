import Component from '@glimmer/component';

import { PowerCalendarAPI } from 'ember-power-calendar/power-calendar';
import PowerCalendarService from 'ember-power-calendar/services/power-calendar';

export interface CalendarDay {
    [x: string]: any;
    id: string;
    number: number;
    date: Date;
    isDisabled: boolean;
    isFocused: boolean;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    datetime?: moment.Moment;
}

export interface Week {
    id: string;
    days: CalendarDay[];
    missingDays: number;
}

export interface PowerCalendarDaysArgs {
    calendar: PowerCalendarAPI;
    maxLength?: number;
    dayClass?: string;
    startOfWeek?: number;
    showDaysAround?: boolean;
    minDate?: Date | moment.Moment;
    maxDate?: Date | moment.Moment;
    disabledDates?: Date[] | moment.Moment[];
    weekdayFormat?: 'short' | 'long' | 'min';
}

export interface PowerCalendarDaysSignature {
    Args: PowerCalendarDaysArgs;
    Blocks: {
        default?: [CalendarDay, PowerCalendarAPI, Week[]];
    };
}

export default class PowerCalendarDays extends Component<PowerCalendarDaysSignature> {
    readonly weekdaysMin: string[];
    readonly weekdaysShort: string[];
    readonly weekdays: string[];
    readonly localeStartOfWeek: number;
    readonly weekdaysNames: string[];
    readonly days: Date[];
    readonly weeks: Week[];
    readonly currentCenter: Date;
    readonly powerCalendarService: PowerCalendarService;
    handleDayFocus: (e: FocusEvent) => void;
    handleDayBlur: () => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    buildDay(date: Date, today: Date, calendar: PowerCalendarAPI): CalendarDay;
    buildonSelectValue: (day: Date) => Date;
    dayIsSelected: (date: Date, calendar?: PowerCalendarAPI) => boolean;
    dayIsDisabled: (date: Date) => boolean;
    firstDay: () => moment.Moment;
    lastDay: () => moment.Moment;
    _updateFocused: (id: string) => void;
    _focusDate: (id: string) => void;
    handleClick: (e: MouseEvent) => void;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        PowerCalendarDays: typeof PowerCalendarDays;
    }
}
