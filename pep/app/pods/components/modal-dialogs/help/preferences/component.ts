import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';

import { LanguageCode } from 'pep/constants/lang';
import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';
import { ThemeId } from 'pep/constants/themes';
import CurrentUserService from 'pep/services/current-user';
import LangService from 'pep/services/lang';
import ThemeService from 'pep/services/theme';
import { guard } from 'pep/utils/types';

interface ModalDialogsHelpPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpPreferences extends Component<ModalDialogsHelpPreferencesArgs> {
    @service currentUser!: CurrentUserService;

    tourEnabled = PreferenceKey.TOUR_ENABLED;
    /**
     * Close the preferences modal dialog
     */
    @action
    done() {
        this.args.onClose();
    }

    /**
     * Updates and saves user preference fields
     * @param {PreferenceKey} key
     * @param {String} newThemeId
     */
    @restartableTask
    *updatePreferenceTask<K extends PreferenceKey>(key: K, value: UserPreferences[K]) {
        yield timeout(250);
        yield this.currentUser.updatePrefs({ [key]: value });
    }

    /**
     * Calls the update preference task to debounce save
     *
     * @template K
     * @param {K} key
     * @param {(UserPreferences[K] | InputEvent)} value
     * @return {*}
     * @memberof ModalDialogsUserPreferences
     */
    @action
    updatePreference<K extends PreferenceKey>(key: K, value: UserPreferences[K] | InputEvent) {
        let newValue = value;
        if (guard<InputEvent>(newValue, 'data')) {
            newValue = newValue.data as UserPreferences[K];
        }
        return taskFor(this.updatePreferenceTask).perform(key, newValue);
    }
}
