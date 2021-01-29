import { getOwner } from '@ember/application';

export async function onAuthenticated(owner: any) {
    const currentUserService = getOwner(owner).lookup(`service:current-user`);
    const notificationsService = getOwner(owner).lookup(`service:notifications`);
    const intlService = getOwner(owner).lookup(`service:intl`);
    const themeService = getOwner(owner).lookup(`service:theme`);
    const langService = getOwner(owner).lookup(`service:lang`);
    const configurationService = getOwner(owner).lookup(`service:configuration`);

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
