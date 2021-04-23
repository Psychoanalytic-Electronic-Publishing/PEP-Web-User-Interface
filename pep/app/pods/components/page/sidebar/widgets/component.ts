import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

    @tracked
    openWidgets: WIDGET[] = this.args.widgets?.filter((widget) => widget.open).map((widget) => widget.widget) ?? [];

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
            this.openWidgets = this.openWidgets.filter((item) => item !== widget);
        } else {
            this.openWidgets = [...this.openWidgets, widget];
        }
    }

    /**
     * Open/close all widgets
     *
     * @memberof PageSidebarWidgets
     */
    @action
    toggleAll() {
        if (this.showCloseAll) {
            this.openWidgets = [];
        } else {
            this.openWidgets = [...Object.values(WIDGET).filter((k) => typeof k === 'string')] as WIDGET[];
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Widgets': typeof PageSidebarWidgets;
    }
}
