import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThemeService from 'pep/services/theme';

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
    updateTheme(newThemeId: string) {
        this.theme.updateTheme(newThemeId);
    }
}
