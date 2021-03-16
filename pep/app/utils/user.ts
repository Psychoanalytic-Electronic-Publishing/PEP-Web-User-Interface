import { getOwner } from '@ember/application';
import Controller from '@ember/controller';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Service from '@ember/service';
import Component from '@glimmer/component';

import ModelRegistry from 'ember-data/types/registries/model';

import CanService from 'pep/services/can';

/**
 * Functionality for loading user and configs after authentication
 *
 * @export
 * @param {*} owner
 * @return {Promise<any>}
 */
export async function onAuthenticated(owner: Controller | Route | Component | Service): Promise<any> {
    const currentOwner = getOwner(owner);
    const currentUserService = currentOwner.lookup(`service:current-user`);
    const notificationsService = currentOwner.lookup(`service:notifications`);
    const intlService = currentOwner.lookup(`service:intl`);
    const themeService = currentOwner.lookup(`service:theme`);
    const langService = currentOwner.lookup(`service:lang`);
    const configurationService = currentOwner.lookup(`service:configuration`);
    const session = currentOwner.lookup('service:session');

    try {
        // get the current user's model before transitioning from the login page
        await currentUserService.load();
    } catch (err) {
        notificationsService.error(intlService.t('login.error'));
        throw err;
    }

    currentUserService.setup();
    currentUserService.setFontSize(currentUserService.fontSize.id);
    await Promise.all([themeService, langService, configurationService].invoke('setup'));
    return session.trigger('authenticationAndSetupSucceeded');
}

/**
 * Check and see if the route can be accessed via permission lookup with the `ember-can` library
 *
 * @export
 * @param {Route} owner
 * @param {string[]} abilities
 * @param {ModelRegistry} [model]
 * @return {*}  {boolean}
 */
export function canAccessRoute(owner: Route, abilities: string[], model?: ModelRegistry): boolean {
    const currentOwner = getOwner(owner);
    const canService = currentOwner.lookup(`service:can`) as CanService;
    let access = true;
    for (const ability of abilities) {
        //if we can't perform this ability, forward to the 403 page
        if (canService.cannot(ability, model, {})) {
            access = false;
        }
    }
    return access;
}

export function handleRouteAuthorization(owner: Route, abilities: string[], model?: ModelRegistry): void {
    const currentOwner = getOwner(owner);
    const routerService = currentOwner.lookup(`service:router`) as RouterService;
    const access = canAccessRoute(owner, abilities, model);
    if (!access) {
        routerService.transitionTo('four-oh-three');
    }
}
