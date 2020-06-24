import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ThemeService from 'pep/services/theme';

interface ModalDialogsUserPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsUserPreferences extends Component<ModalDialogsUserPreferencesArgs> {
    @service theme!: ThemeService;

    @action
    done() {
        this.args.onClose();
    }

    @action
    updateTheme(newThemeId: string) {
        this.theme.updateTheme(newThemeId);
    }
}
