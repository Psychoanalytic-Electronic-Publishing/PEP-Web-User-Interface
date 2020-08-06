// app/mixins/authorized-route.ts
import CanService from 'pep/services/can';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ModelRegistry from 'ember-data/types/registries/model';

type Constructor<T = Route> = new (...args: any[]) => T;

/**
 * A mixin that checks user authorization upon page load
 *
 * @export
 * @template TBase
 * @param {TBase} Base
 */
export default function AuthorizedRoute<TBase extends Constructor>(Base: TBase) {
    class AuthorizedRouteClass extends Base {
        @service can!: CanService;

        /**
         * An array of abilities related to a given model used
         * to determine permissions on a route
         *
         * An `ability.ts` file must be defined in the model's folder
         *
         * usage:
         *
         * `export default class ProfileRoute extends AuthorizedRoute(Route) {
         *      abilities = ['user.admin', 'user.editProfile']
         * }`
         *
         * @type {string[]}
         */
        abilities: string[] = [];

        /**
         * An optional route property set to check abilities
         * before fetching the model
         *
         * @type {boolean}
         */
        authRequiresModel: boolean = false;

        /**
         * Iterate through the list of abilities passed to
         * the route and transition to `403` if any fail
         *
         * @param {ModelRegistry} [model]
         */
        private checkAbilities(model?: ModelRegistry): void {
            for (let ability of this.abilities) {
                //if we can't perform this ability, forward to the 403 page
                if (this.can.cannot(ability, model, {})) {
                    this.transitionTo('four-oh-three');
                }
            }
        }

        /**
         * Run `this.checkAbilities` if `this.authRequiresModel`
         * is false
         *
         * @param {Transition} transition
         * @returns {any}
         */
        beforeModel(transition: Transition) {
            if (!this.authRequiresModel) {
                this.checkAbilities();
            }

            return super.beforeModel(transition);
        }

        /**
         * Run `this.checkAbilities` if `this.authRequiresModel`
         * is true
         *
         * @param {ModelRegistry} model
         * @param {Transition} transition
         * @returns {any}
         */
        afterModel(model: ModelRegistry, transition: Transition) {
            if (this.authRequiresModel) {
                this.checkAbilities(model);
            }

            return super.afterModel(model, transition);
        }
    }

    return AuthorizedRouteClass;
}
