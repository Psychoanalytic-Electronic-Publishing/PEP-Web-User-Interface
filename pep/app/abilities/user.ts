import { inject as service } from '@ember/service';

import { Ability } from 'ember-can';

import CurrentUserService from 'pep/services/current-user';

export default class UserAbilityAbility extends Ability {
    @service currentUser!: CurrentUserService;

    get canViewAdmin() {
        return this.currentUser.user?.isAdmin;
    }
}
