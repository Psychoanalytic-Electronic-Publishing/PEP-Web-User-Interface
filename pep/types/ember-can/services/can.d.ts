import Service from '@ember/service';

declare module 'ember-can/services/can' {
    export default class can extends Service.extend() {
        parse(abilityString: string): Object;
        abilityFor(abilityName: string, model: any, properties: Object): any;
        valueFor(propertyName: string, abilityName: string, model: any, properties: Object): any;
        can(abilityString: string, model: any, properties: Object): boolean;
        cannot(abilityString: string, model: any, properties: Object): boolean;
    }
}
