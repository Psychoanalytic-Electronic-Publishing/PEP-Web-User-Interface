import Component from '@glimmer/component';

import { PowerCalendarAPI } from 'ember-power-calendar/power-calendar';

export interface PowerCalendarNavArgs {
    calendar: PowerCalendarAPI;
}

export interface PowerCalendarNavSignature {
    Args: PowerCalendarNavArgs;
    Blocks: {
        default?: [PowerCalendarAPI];
    };
}

export default class PowerCalendarNav extends Component<PowerCalendarNavSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        PowerCalendarNav: typeof PowerCalendarNav;
    }
}
