import { inject as service } from '@ember/service';

import { Ability } from 'ember-can';

import CurrentUserService from 'pep/services/current-user';

export default class UserAbility extends Ability {
    @service currentUser!: CurrentUserService;

    /**
     * Whether or not the user can view admin pages
     *
     * @readonly
     * @type {boolean}
     * @memberof UserAbility
     */
    get canViewAdmin(): boolean {
        return this.currentUser.user?.isAdmin ?? false;
    }
}
