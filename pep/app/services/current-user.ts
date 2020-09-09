import { set } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { reject } from 'rsvp';

import User from 'pep/pods/user/model';
import Session from 'pep/services/pep-session';

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service session!: Session;

    @tracked user: User | null = null;

    /**
     * Loads the current user from the API
     * @returns {Promise<User>}
     */
    load(): Promise<User> {
        return this.fetchUser();
    }

    /**
     * Refreshes the current user if logged in
     * @returns {Promise}
     */
    refresh(): Promise<User> {
        //only attempt to refresh the user if there is a logged in user
        if (this.session.isAuthenticated) {
            return this.fetchUser();
        }
        return reject();
    }

    /**
     * Fetches the current user model
     * @returns Promise<User>
     */
    async fetchUser(): Promise<User> {
        // TODO reenable when we have a real endpoint to hit
        // const result = await this.store.query('user', { me: true });
        // const user = result[0];

        //TODO remove this when we have a real endpoint to hit
        this.store.pushPayload('user', {
            user: {
                id: 1,
                firstName: 'Joe',
                lastName: 'User',
                username: 'joe.user',
                institutionBrandLogoUrl:
                    'https://www.jhu.edu/assets/themes/machado/assets/images/logos/university-logo-small-vertical-white-no-clear-space-29e2bdee83.png'
            }
        });

        const user = this.store.peekRecord('user', 1)!;

        // TODO can we improve this at all so we dont need to ts-ignore it?
        // @ts-ignore allow setting a non-standard property `user` on the session service instance
        set(this.session, 'user', user);
        this.user = user;
        return user;
    }
}
