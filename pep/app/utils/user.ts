import { getOwner } from '@ember/application';
import Controller from '@ember/controller';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import Service from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import ModelRegistry from 'ember-data/types/registries/model';

import { PreferenceDocumentsKey, PreferenceKey } from 'pep/constants/preferences';
import Document from 'pep/pods/document/model';
import CanService from 'pep/services/can';
import CurrentUserService, { UserPreferenceErrorId } from 'pep/services/current-user';

/**
 * Functionality for loading user and configs after authentication
 *
 * @export
 * @param {*} owner
 * @return {Promise<any>}
 */
export async function onAuthenticated(owner: Controller | Route | Component | Service): Promise<any> {
    const currentOwner = getOwner(owner);
    const currentUserService = currentOwner.lookup(`service:current-user`) as CurrentUserService;
    const notificationsService = currentOwner.lookup(`service:notifications`);
    const intlService = currentOwner.lookup(`service:intl`);
    const themeService = currentOwner.lookup(`service:theme`);
    const langService = currentOwner.lookup(`service:lang`);
    const configurationService = currentOwner.lookup(`service:configuration`);
    const session = currentOwner.lookup('service:pep-session');
    const introTour = currentOwner.lookup('service:intro-tour');
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
    const showTour = currentUserService.preferences?.tourEnabled;
    if (showTour) {
        introTour.show();
    }

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

/**
 * Handle route authentication in one easy method. Just call this method with the abilities you want to check and you will be either sent on your merry way
 * or forwarded to the 403 page if you dont have access
 *
 * @export
 * @param {Route} owner
 * @param {string[]} abilities
 * @param {ModelRegistry} [model]
 */
export function handleRouteAuthorization(owner: Route, abilities: string[], model?: ModelRegistry): void {
    const currentOwner = getOwner(owner);
    const routerService = currentOwner.lookup(`service:router`) as RouterService;
    const access = canAccessRoute(owner, abilities, model);
    if (!access) {
        routerService.transitionTo('four-oh-three');
    }
}

/**
 * Update the user preference documents (Favorites and Read Later lists). This method handles both addition and subtraction
 *
 * @export
 * @param {(Component | Controller)} owner
 * @param {PreferenceDocumentsKey} key
 * @param {Document} document
 */
export async function updateUserPreferencesDocument(
    owner: Component | Controller,
    key: PreferenceDocumentsKey,
    document: Document
) {
    const showPreferenceDocumentErrorMessage = (key: PreferenceDocumentsKey) => {
        notifications.error(
            intl.t(`search.item.notifications.failure.${key === PreferenceKey.FAVORITES ? 'favorites' : 'readLater'}`)
        );
    };
    const notifications = getOwner(owner).lookup('service:notifications');
    const user = getOwner(owner).lookup('service:currentUser');
    const intl = getOwner(owner).lookup('service:intl');
    try {
        if (user.hasPreferenceDocument(key, document.id)) {
            const result = await user.removePreferenceDocument(key, document.id);
            if (result.isOk()) {
                notifications.success(
                    intl.t(
                        `search.item.notifications.success.removeFrom${
                            key === PreferenceKey.FAVORITES ? 'Favorites' : 'ReadLater'
                        }`
                    )
                );
            } else if (
                result.error.id !== UserPreferenceErrorId.GROUP &&
                result.error.id !== UserPreferenceErrorId.UNAUTHENTICATED
            ) {
                showPreferenceDocumentErrorMessage(key);
            }
        } else {
            const result = await user.addPreferenceDocument(key, document.id);
            if (result.isOk()) {
                notifications.success(
                    intl.t(
                        `search.item.notifications.success.addTo${
                            key === PreferenceKey.FAVORITES ? 'Favorites' : 'ReadLater'
                        }`
                    )
                );
            } else if (
                result.error.id !== UserPreferenceErrorId.GROUP &&
                result.error.id !== UserPreferenceErrorId.UNAUTHENTICATED
            ) {
                showPreferenceDocumentErrorMessage(key);
            }
        }
    } catch (errors) {
        showPreferenceDocumentErrorMessage(key);
    }
}
