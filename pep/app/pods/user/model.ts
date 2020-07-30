import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class User extends DS.Model {
    @attr('string') firstName!: string;
    @attr('string') lastName!: string;
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
