import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import IntlService from 'ember-intl/services/intl';

import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';
import { ThemeId } from 'pep/constants/themes';
import CurrentUserService from 'pep/services/current-user';
import ThemeService from 'pep/services/theme';
import { guard } from 'pep/utils/types';

interface ModalDialogsUserPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsUserPreferences extends Component<ModalDialogsUserPreferencesArgs> {
    @service theme!: ThemeService;
    @service currentUser!: CurrentUserService;
    @service intl!: IntlService;

    searchEnabledKey = PreferenceKey.SEARCH_PREVIEW_ENABLED;
    hicLimit = PreferenceKey.SEARCH_HIC_LIMIT;

    /**
     * Close the preferences modal dialog
     */
    @action
    done() {
        this.args.onClose();
    }

    /**
     * Update the current theme
     * @param {String} newThemeId
     */
    @action
    updateTheme(newThemeId: ThemeId) {
        this.theme.updateTheme(newThemeId);
    }

    /**
     * Updates and saves user preference fields
     * @param {PreferenceKey} key
     * @param {String} newThemeId
     */
    @action
    updatePreference<K extends PreferenceKey>(key: K, value: UserPreferences[K] | InputEvent) {
        let newValue = value;
        if (guard<InputEvent>(newValue, 'data')) {
            newValue = newValue.data as UserPreferences[K];
        }
        this.currentUser.updatePrefs({ [key]: newValue });
    }
}
