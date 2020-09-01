import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { WIDGET } from 'pep/constants/sidebar';
import { action } from '@ember/object';
import { WidgetConfiguration } from 'pep/constants/configuration';

export interface PageSidebarWidgetsArgs {
    widgets: WidgetConfiguration[];
}
export interface PageSidebarWidgetArgs extends PageSidebarWidgetsArgs {
    toggleIsOpen: (widget: WIDGET) => void;
    openWidgets: WIDGET[];
}

export default class PageSidebarWidgets extends Component<PageSidebarWidgetsArgs> {
    @tracked openWidgets: WIDGET[] =
        this.args.widgets?.filter((widget) => widget.open).map((widget) => widget.widget) ?? [];
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
