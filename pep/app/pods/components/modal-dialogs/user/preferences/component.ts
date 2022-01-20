import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { timeout } from 'ember-concurrency';
import { enqueueTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';

import { LanguageCode } from 'pep/constants/lang';
import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';
import { WIDGET, WIDGETS } from 'pep/constants/sidebar';
import { FontSize, TextJustificationId } from 'pep/constants/text';
import { ThemeId } from 'pep/constants/themes';
import CurrentUserService, { UserPreferenceError } from 'pep/services/current-user';
import LangService from 'pep/services/lang';
import NotificationsService from 'pep/services/notifications';
import PepSessionService from 'pep/services/pep-session';
import ThemeService from 'pep/services/theme';
import { BaseGlimmerSignature, guard } from 'pep/utils/types';
import { Result } from 'true-myth/result';

interface ModalDialogsUserPreferencesArgs {
    onClose: () => void;
}

export default class ModalDialogsUserPreferences extends Component<
    BaseGlimmerSignature<ModalDialogsUserPreferencesArgs>
> {
    @service theme!: ThemeService;
    @service currentUser!: CurrentUserService;
    @service intl!: IntlService;
    @service lang!: LangService;
    @service notifications!: NotificationsService;
    @service('pep-session') session!: PepSessionService;

    @tracked searchHicLimit = this.currentUser.preferences?.searchHICLimit?.toString();

    searchEnabledKey = PreferenceKey.SEARCH_PREVIEW_ENABLED;
    hicLimit = PreferenceKey.SEARCH_HIC_LIMIT;
    glossaryFormattingEnabledKey = PreferenceKey.GLOSSARY_FORMATTING_ENABLED;
    userSearchFormStickyKey = PreferenceKey.USER_SEARCH_FORM_STICKY;
    commentsEnabledKey = PreferenceKey.COMMENTS_ENABLED;

    get widgets() {
        return WIDGETS.map((widget) => ({
            ...widget,
            label: this.intl.t(widget.label)
        }));
    }

    /**
     * Close the preferences modal dialog
     */
    @action
    done() {
        this.args.onClose();
    }

    /**
     * Update font size
     *
     * @param {FontSize} size
     * @memberof ModalDialogsUserPreferences
     */
    @action
    async updateFontSize(size: FontSize) {
        try {
            const result = await this.currentUser.updateFontSize(size);
            if (result.isOk()) {
                this.currentUser.setFontSize(size);
            }
        } catch (error) {
            this.notifications.errors(error, {});
        }
    }

    /**
     * Update the text justification for the document
     *
     * @param {TextJustificationId} justification
     * @memberof ModalDialogsUserPreferences
     */
    @action
    updateTextJustification(justification: TextJustificationId) {
        this.currentUser.updateTextJustification(justification);
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
     * Update the current theme
     * @param {String} newThemeId
     */
    @action
    updateLanguage(lang: LanguageCode) {
        this.lang.changeLanguage(lang);
    }

    /**
     * Updates and saves user preference fields
     * @param {PreferenceKey} key
     * @param {String} newThemeId
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

    /**
     * Update the HIC limit
     *
     * @param {InputEvent} value
     * @return {*}
     * @memberof ModalDialogsUserPreferences
     */
    @action
    updateHicLimit(value: InputEvent) {
        const newValue = Number(value.data) as UserPreferences['searchHICLimit'];
        this.searchHicLimit = value.data ?? undefined;
        return taskFor(this.updatePreferenceTask).perform(this.hicLimit, newValue);
    }

    /**
     * Update visible widget list
     *
     * @param {WIDGET} widget
     * @param {boolean} selected
     * @memberof ModalDialogsUserPreferences
     */
    @action
    async updateWidgetsList(
        widget: WIDGET,
        selected: boolean
    ): Promise<Result<UserPreferences | undefined, UserPreferenceError> | undefined> {
        if (selected) {
            const widgets = [...new Set(this.currentUser.preferences?.visibleWidgets)];
            widgets.push(widget);
            return this.currentUser.updatePrefs({ [PreferenceKey.VISIBLE_WIDGETS]: widgets });
        } else {
            const index = this.currentUser.preferences?.visibleWidgets.indexOf(widget);
            const widgets = [...new Set(this.currentUser.preferences?.visibleWidgets)];

            if (widgets && index !== undefined) {
                widgets.removeAt(index);
                return this.currentUser.updatePrefs({ [PreferenceKey.VISIBLE_WIDGETS]: widgets });
            } else {
                return;
            }
        }
    }
}
