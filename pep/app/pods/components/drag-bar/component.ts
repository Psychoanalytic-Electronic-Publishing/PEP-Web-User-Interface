import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { DRAG_BAR_THICKNESS, FOOT_BAR_HEIGHT, NAV_BAR_HEIGHT } from 'pep/constants/dimensions';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { ElementOffset, getElementOffset, getEventOffset } from 'pep/utils/dom';
import { clamp } from 'pep/utils/math';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface DragBarArgs {
    orientation?: 'vertical' | 'horizontal';
    detachedDrag?: boolean;
    minClientY?: number;
    maxClientY?: number;
    minClientX?: number;
    maxClientX?: number;
    reversed?: boolean;
    onDragStart?: (
        offset: ElementOffset,
        event: HTMLElementMouseEvent<HTMLDivElement> | HTMLElementTouchEvent<HTMLDivElement>
    ) => void;
    onDragMove?: (currentPosition: number, event: MouseEvent | TouchEvent) => void;
    onDragEnd?: (endPosition: number, event: MouseEvent | TouchEvent) => void;
}

export default class DragBar extends Component<BaseGlimmerSignature<DragBarArgs>> {
    @service fastboot!: FastbootService;

    @tracked dragBarPosition: number | null = null;
    @tracked dragBarOffset: ElementOffset | null = null;
    @tracked isDragging: boolean = false;

    /**
     * The orientation/axis to display the drag bar on
     * @readonly
     * @returns {'vertical' | 'horizontal'}
     */
    get orientation() {
        return this.args.orientation ?? 'horizontal';
    }

    /**
     * When reversed, min/max X/Y calculations start from the opposite side
     * @readonly
     * @returns {boolean}
     */
    get reversed() {
        return this.args.reversed ?? false;
    }

    /**
     * When true, the drag bar repositions itself independently while dragging
     * and assumes the parent element it is attached to is remaining stationary
     * @readonly
     * @returns {boolean}
     */
    get detachedDrag() {
        return this.args.detachedDrag ?? false;
    }

    /**
     * The minimum allowed y axis drag position relative to the TOP of the document
     * Defaults to just below the app's main nav bar
     * @readonly
     * @returns {number}
     */
    get minClientY() {
        return this.args.minClientY ?? NAV_BAR_HEIGHT;
    }

    /**
     * The maximum allowed y axis drag position relative to the BOTTOM of the document
     * Defaults to just above the app's footer bar
     * @readonly
     * @returns {number}
     */
    get maxClientY() {
        return this.args.maxClientY ?? FOOT_BAR_HEIGHT;
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
        return this.args.detachedDrag && this.dragBarPosition !== null
            ? htmlSafe(`${prop}: ${this.dragBarPosition}px;`)
            : null;
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
        document.body.classList?.add?.('drag-bar-is-dragging');
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
            this.dragBarPosition = this.calculateNewHorizPosition(eventOffset);
        } else {
            this.dragBarPosition = this.calculateNewVertPosition(eventOffset);
        }

        this.args.onDragMove?.(this.dragBarPosition, event);
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
        document.body.classList?.remove?.('drag-bar-is-dragging');
        const eventOffset = getEventOffset(event);
        const lastDragPos = this.dragBarPosition ?? 0;
        let endPosition;

        if (this.orientation === 'horizontal') {
            const newDragPos = this.calculateNewHorizPosition(eventOffset);
            endPosition = eventOffset.top ? newDragPos : lastDragPos;
        } else {
            const newDragPos = this.calculateNewVertPosition(eventOffset);
            endPosition = eventOffset.left ? newDragPos : lastDragPos;
        }

        this.isDragging = false;
        this.dragBarPosition = null;
        this.dragBarOffset = null;
        this.args.onDragEnd?.(endPosition, event);
    }

    /**
     * Calculates the new relative position of the dragged element for horizontally oriented drag bars
     * @private
     * @param {ElementOffset} eventOffset
     * @returns {number}
     */
    private calculateNewHorizPosition(eventOffset: ElementOffset) {
        const minY = this.minClientY;
        const maxY = document.body.offsetHeight - DRAG_BAR_THICKNESS - this.maxClientY;
        const yOffset = clamp(eventOffset.top, minY, maxY);
        const top = this.dragBarOffset?.top ?? 0;
        return yOffset - top;
    }

    /**
     * Calculates the new relative position of the dragged element for vertically oriented drag bars
     * @private
     * @param {ElementOffset} eventOffset
     * @returns {number}
     */
    private calculateNewVertPosition(eventOffset: ElementOffset) {
        const docW = document.body.offsetWidth;
        const minX = this.reversed ? docW - this.maxClientX : this.minClientX;
        const maxX = this.reversed ? docW - this.minClientX : this.maxClientX;
        const xOffset = clamp(eventOffset.left, minX, maxX);
        const left = this.dragBarOffset?.left ?? 0;
        return this.reversed ? xOffset - left : xOffset + DRAG_BAR_THICKNESS;
    }
}
