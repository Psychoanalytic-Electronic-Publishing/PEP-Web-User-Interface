import User from 'pep/pods/user/model';
import { get, set } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import SessionService from 'ember-simple-auth/services/session';
import { reject } from 'rsvp';

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service session!: SessionService;

    @tracked user: User | null = null;

    /**
     * Loads the current user from the API
     * @return {Promise<User>}
     */
    load(): Promise<User> {
        return this.fetchUser();
    }

    /**
     * Refreshes the current user if logged in
     * @return {Promise}
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
        const result = await this.store.query('user', { me: true });
        const user = get(result, 'firstObject') as User;
        // TODO can we improve this at all so we dont need to ts-ignore it?
        // @ts-ignore allow setting a non-standard property `user` on the session service instance
        set(this.session, 'user', user);
        this.user = user;
        return user;
    }
}
