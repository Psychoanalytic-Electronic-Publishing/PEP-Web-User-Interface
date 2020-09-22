import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ThemeService from 'pep/services/theme';
import { ThemeId } from 'pep/constants/themes';

interface ModalDialogsUserPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsUserPreferences extends Component<ModalDialogsUserPreferencesArgs> {
    @service theme!: ThemeService;

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
}
