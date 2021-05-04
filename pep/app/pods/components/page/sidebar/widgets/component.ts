import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { WidgetConfiguration } from 'pep/constants/configuration';
import { WIDGET, WidgetData } from 'pep/constants/sidebar';
import CurrentUserService from 'pep/services/current-user';
import { BaseGlimmerSignature } from 'pep/utils/types';

export interface PageSidebarWidgetArgs {
    widgets: WidgetConfiguration[];
    data: WidgetData;
}

export interface BasePageSidebarWidgetArgs extends PageSidebarWidgetArgs {
    toggleIsOpen: (widget: WIDGET) => void;
    openWidgets: WIDGET[];
}

export default class PageSidebarWidgets extends Component<BaseGlimmerSignature<PageSidebarWidgetArgs>> {
    @service currentUser!: CurrentUserService;

    get openWidgets(): WIDGET[] {
        const allWidgets = this.args.widgets;
        const userWidgetConfigurations = this.currentUser.preferences?.widgetConfigurations;
        const userOverridenWidgets = allWidgets.map((widgetConfiguration) => {
            const userSavedConfiguration = userWidgetConfigurations?.find(
                (item) => item.widget === widgetConfiguration.widget
            );
            if (userSavedConfiguration) {
                return userSavedConfiguration;
            } else {
                return widgetConfiguration;
            }
        });
        const openedWidgets = userOverridenWidgets.filter((widget) => widget.open).map((widget) => widget.widget) ?? [];
        return openedWidgets;
    }
    /**
     * Getter that decides when we show close all
     *
     * @readonly
     * @memberof PageSidebarWidgets
     */
    get showCloseAll() {
        return this.openWidgets.length >= 2;
    }

    /**
     * Toggle the open/close of the widget
     *
     * @param {WIDGET} widget
     * @memberof PageSidebarWidgets
     */
    @action
    toggleIsOpen(widget: WIDGET) {
        if (this.openWidgets.includes(widget)) {
            this.currentUser.modifyWidgetConfigurations([
                {
                    widget,
                    open: false
                }
            ]);
        } else {
            this.currentUser.modifyWidgetConfigurations([
                {
                    widget,
                    open: true
                }
            ]);
        }
    }

    /**
     * Open/close all widgets
     *
     * @memberof PageSidebarWidgets
     */
    @action
    toggleAll() {
        const widgets = [...Object.values(WIDGET).filter((k) => typeof k === 'string')] as WIDGET[];
        if (this.showCloseAll) {
            const widgetConfigurations = widgets.map((widget) => {
                return {
                    widget,
                    open: false
                };
            });
            this.currentUser.modifyWidgetConfigurations(widgetConfigurations);
        } else {
            const widgetConfigurations = widgets.map((widget) => {
                return {
                    widget,
                    open: true
                };
            });
            this.currentUser.modifyWidgetConfigurations(widgetConfigurations);
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Widgets': typeof PageSidebarWidgets;
    }
}
