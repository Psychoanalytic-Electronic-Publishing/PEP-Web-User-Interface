import { getOwner } from '@ember/application';

/**
 * Functionality for loading user and configs after authentication
 *
 * @export
 * @param {*} owner
 * @return {Promise<any>}
 */
export async function onAuthenticated(owner: any) {
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
