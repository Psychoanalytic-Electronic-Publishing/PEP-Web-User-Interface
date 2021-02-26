import { getOwner } from '@ember/application';
import Controller from '@ember/controller';
import Route from '@ember/routing/route';
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
export async function onAuthenticated(owner: Controller | Route | Component): Promise<any> {
    const currentOwner = getOwner(owner);
    const currentUserService = currentOwner.lookup(`service:current-user`);
    const notificationsService = currentOwner.lookup(`service:notifications`);
    const intlService = currentOwner.lookup(`service:intl`);
    const themeService = currentOwner.lookup(`service:theme`);
    const langService = currentOwner.lookup(`service:lang`);
    const configurationService = currentOwner.lookup(`service:configuration`);

    try {
        // get the current user's model before transitioning from the login page
        await currentUserService.load();
    } catch (err) {
        notificationsService.error(intlService.t('login.error'));
        throw err;
    }

    currentUserService.setup();
    currentUserService.setFontSize(currentUserService.fontSize.id);
    await themeService.setup();
    await langService.setup();
    return configurationService.setup();
}

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
