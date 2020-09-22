import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ThemeService from 'pep/services/theme';
import CurrentUserService from 'pep/services/current-user';
import IntlService from 'ember-intl/services/intl';
import { ThemeId } from 'pep/constants/themes';
import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';

interface ModalDialogsUserPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsUserPreferences extends Component<ModalDialogsUserPreferencesArgs> {
    @service theme!: ThemeService;
    @service currentUser!: CurrentUserService;
    @service intl!: IntlService;

    searchEnabledKey = PreferenceKey.SEARCH_PREVIEW_ENABLED;

    get searchPreviewOptions() {
        return [
            { value: true, label: this.intl.t('preferences.search.preview.enabled') },
            { value: false, label: this.intl.t('preferences.search.preview.disabled') }
        ];
    }

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
     * @param {isBooleanValue} boolean
     * @param {String} newThemeId
     */
    @action
    updatePreference<K extends PreferenceKey>(key: K, isBooleanValue: boolean, value: UserPreferences[K]) {
        // <select> fields always store <option> values as strings, so if we want to update
        // a boolean-type pref value, we need to parse it back into a actually boolean, e.g. "false" => false
        const newValue = isBooleanValue ? JSON.parse(value as string) : value;
        this.currentUser.updatePrefs({ [key]: newValue });
    }
}
