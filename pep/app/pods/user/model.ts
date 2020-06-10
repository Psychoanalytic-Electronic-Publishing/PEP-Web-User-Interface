import { unsendable } from 'pep/decorators/models';
import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class User extends DS.Model {
    @attr('string') email!: string;
    @attr('string') firstName!: string;
    @attr('string') lastName!: string;
    @attr('string') password!: string;
    @attr('string') passwordConfirmation!: string;
    @unsendable @attr('date') registeredOn!: Date;
    @attr('string') username!: string;

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        user: User;
    }
}
