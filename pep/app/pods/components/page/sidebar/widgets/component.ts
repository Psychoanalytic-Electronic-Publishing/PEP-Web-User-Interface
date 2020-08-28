import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { WIDGET } from 'pep/constants/sidebar';
import { action } from '@ember/object';

interface PageSidebarWidgetsArgs {}

export interface PageSidebarWidgetArgs {
    toggleIsOpen: (widget: WIDGET) => void;
    openWidgets: WIDGET[];
}

export default class PageSidebarWidgets extends Component<PageSidebarWidgetsArgs> {
    @tracked openWidgets: WIDGET[] = [WIDGET.WHATS_NEW, WIDGET.MOST_CITED, WIDGET.MOST_VIEWED];

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
            this.openWidgets = [...Object.values(WIDGET).filter((k) => typeof k === 'number')] as WIDGET[];
        }
    }
}
