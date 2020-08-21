import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { getElementOffset, ElementOffset, getEventOffset } from 'pep/utils/dom';

interface DragBarArgs {
    orientation?: 'vertical' | 'horizontal';
    minClientY?: number;
    maxClientY?: number;
    minClientX?: number;
    maxClientX?: number;
    onDragStart?: (
        offset: ElementOffset,
        event: HTMLElementMouseEvent<HTMLDivElement> | HTMLElementTouchEvent<HTMLDivElement>
    ) => void;
    onDragEnd?: (endPosition: number, event: MouseEvent | TouchEvent) => void;
}

export default class DragBar extends Component<DragBarArgs> {
    @service fastboot!: FastbootService;

    @tracked dragBarPosition: number | null = null;
    @tracked dragBarOffset: ElementOffset | null = null;
    @tracked isDragging: boolean = false;

    barThickness: number = 5;

    /**
     * The orientation/axis to display the drag bar on
     * @readonly
     * @returns {'vertical' | 'horizontal'}
     */
    get orientation() {
        return this.args.orientation ?? 'horizontal';
    }

    /**
     * The minimum allowed y axis drag position relative to the TOP of the document
     * Defaults to just below the app's main nav bar
     * @readonly
     * @returns {number}
     */
    get minClientY() {
        return this.args.minClientY ?? 58;
    }

    /**
     * The maximum allowed y axis drag position relative to the BOTTOM of the document
     * Defaults to just above the app's footer bar
     * @readonly
     * @returns {number}
     */
    get maxClientY() {
        return this.args.maxClientY ?? 48;
    }

    /**
     * The minimum allowed x axis drag position relative to the LEFT SIDE of the document
     * @readonly
     * @returns {number}
     */
    get minClientX() {
        return this.args.minClientX ?? 0;
    }

    /**
     * The minimum allowed y axis drag position relative to the RIGHT SIDE of the document
     * @readonly
     * @returns {number}
     */
    get maxClientX() {
        return this.args.maxClientX ?? 0;
    }

    /**
     * The DOM element (<body>) to use as the destination to inject the drag mask
     * via the {{in-element}} helper
     * @readonly
     * @returns {HTMLElement | null}
     */
    get maskDestination() {
        return !this.fastboot.isFastBoot ? document?.body : null;
    }

    /**
     * The CSS styles that set the current position of the drag bar while dragging
     * @readonly
     * @returns {string}
     */
    get dragBarStyles() {
        const prop = this.orientation === 'horizontal' ? 'top' : 'left';
        return this.dragBarPosition !== null ? htmlSafe(`${prop}: ${this.dragBarPosition}px;`) : null;
    }

    /**
     * Unbinds document event listeners when the component is destroyed
     */
    @dontRunInFastboot
    willDestroy() {
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragStop);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragStop);
    }

    /**
     * Initiates the dragging operation on mousedown/touchstart
     * @param {HTMLElementMouseEvent<HTMLDivElement>} event
     */
    @action
    @dontRunInFastboot
    onDragStart(event: HTMLElementMouseEvent<HTMLDivElement> | HTMLElementTouchEvent<HTMLDivElement>) {
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragStop);
        document.addEventListener('touchmove', this.onDragMove);
        document.addEventListener('touchend', this.onDragStop);

        this.isDragging = true;
        this.dragBarOffset = getElementOffset(event.target);
        this.args.onDragStart?.(this.dragBarOffset, event);
    }

    /**
     * Updates the drag bar's current position on mousemove/touchmove
     * @param {MouseEvent} event
     */
    @action
    onDragMove(event: MouseEvent | TouchEvent) {
        const eventOffset = getEventOffset(event);
        if (this.orientation === 'horizontal') {
            const minY = this.minClientY;
            const maxY = document.body.offsetHeight - this.barThickness - this.maxClientY;
            const yOffset = Math.max(minY, Math.min(maxY, eventOffset.top));
            this.dragBarPosition = yOffset - (this.dragBarOffset?.top ?? 0);
        } else {
            const minX = this.minClientX;
            const maxX = document.body.offsetWidth - this.barThickness - this.maxClientX;
            const xOffset = Math.max(minX, Math.min(maxX, eventOffset.left));
            this.dragBarPosition = xOffset - (this.dragBarOffset?.left ?? 0);
        }
    }

    /**
     * Completes the drag operation on mouseup/touchend and removes event listeners
     * @param {MouseEvent} event
     */
    @action
    onDragStop(event: MouseEvent | TouchEvent) {
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragStop);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragStop);
        const eventOffset = getEventOffset(event);
        const lastDragPos = this.dragBarPosition ?? 0;
        const endPosition =
            this.orientation === 'horizontal'
                ? eventOffset.top
                    ? eventOffset.top - (this.dragBarOffset?.top ?? 0)
                    : lastDragPos
                : eventOffset.top
                ? eventOffset.left - (this.dragBarOffset?.left ?? 0)
                : lastDragPos;
        this.isDragging = false;
        this.dragBarPosition = null;
        this.dragBarOffset = null;
        this.args.onDragEnd?.(endPosition, event);
    }
}
