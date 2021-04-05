import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { timeout } from 'ember-concurrency';
import { enqueueTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature, guard } from 'pep/utils/types';

interface ModalDialogsHelpPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsHelpPreferences extends Component<
    BaseGlimmerSignature<ModalDialogsHelpPreferencesArgs>
> {
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;

    tourEnabled = PreferenceKey.TOUR_ENABLED;
    helpDescriptionsEnabled = PreferenceKey.HELP_DESCRIPTIONS_ENABLED;
    helpIconsEnabled = PreferenceKey.HELP_ICONS_ENABLED;
    translationConcordanceEnabled = PreferenceKey.TRANSLATION_CONCORDANCE;
    /**
     * Close the preferences modal dialog
     */
    @action
    done() {
        this.args.onClose();
    }

    /**
     * Updates and saves user help preference fields
     *
     * @template K
     * @param {K} key
     * @param {UserPreferences[K]} value
     * @memberof ModalDialogsHelpPreferences
     */
    @enqueueTask
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
     * @memberof ModalDialogsHelpPreferences
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
