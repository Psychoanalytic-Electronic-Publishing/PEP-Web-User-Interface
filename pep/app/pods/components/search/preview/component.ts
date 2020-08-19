import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

import AuthService from 'pep/services/auth';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';

type SearchPreviewMode = 'minimized' | 'maximized' | 'fit';

interface SearchPreviewArgs {
    mode: SearchPreviewMode;
    maxHeight?: number;
    result?: Document;
    setMode: (mode: SearchPreviewMode) => void;
    close: () => void;
}

// TODO MOVE TO utilities/dom.ts
function getElementOffset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const scrollLeft = window?.pageXOffset || document?.documentElement?.scrollLeft || 0;
    const scrollTop = window?.pageYOffset || document?.documentElement?.scrollTop || 0;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    };
}

export default class SearchPreview extends Component<SearchPreviewArgs> {
    @service session!: SessionService;
    @service auth!: AuthService;

    @tracked fitHeight: number = 0;
    innerElement: HTMLElement | null = null;

    get mode() {
        return this.args.mode || 'fit';
    }

    get styles() {
        return this.mode === 'fit' && this.adjustedFitHeight && this.args.result
            ? htmlSafe(`height: ${this.adjustedFitHeight}px;`)
            : null;
    }

    get adjustedFitHeight() {
        return Math.min(this.fitHeight, this.args.maxHeight || this.fitHeight);
    }

    /**
     * Calculates the height that will allow all the content to show w/o scrolling
     * constrained to a maximum height that is the parent container's height
     */
    @dontRunInFastboot
    updateFitHeight() {
        this.fitHeight = this.innerElement?.offsetHeight ?? 0;
    }

    /**
     * Calculate the content's "fit" height on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.innerElement = element;
        scheduleOnce('afterRender', this, this.updateFitHeight);
    }

    /**
     * Recalculate the content's "fit" height when the result model changes
     */
    @action
    onResultUpdate() {
        scheduleOnce('afterRender', this, this.updateFitHeight);
    }

    /**
     * Sets the preview pane's sizing mode
     * @param {SearchPreviewMode} mode
     */
    @action
    setMode(mode: SearchPreviewMode) {
        // reset the calculated fit size in case it was resized
        if (mode === 'fit') {
            this.updateFitHeight();
        }

        this.args.setMode(mode);
    }

    /**
     * Closes the preview pane
     */
    @action
    close() {
        this.args.close();
        this.fitHeight = 0;
    }

    /**
     * Show the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true);
    }

    //TODO EXTRACT INTO <DragBar> COMPONENT
    @service fastboot!: FastbootService;

    @tracked dragBarPosition: number | null = null;
    @tracked dragBarOffset: { top: number; left: number } | null = null;
    @tracked isDragging: boolean = false;
    barThickness = 5;

    //TODO turn into arg
    orientation: 'vertical' | 'horizontal' = 'horizontal';
    minClientY = 58;
    maxClientY = 32;
    minClientX = 0;
    maxClientX = 0;

    get maskDestination() {
        return !this.fastboot.isFastBoot ? document?.body : null;
    }

    get dragBarStyles() {
        const prop = this.orientation === 'horizontal' ? 'top' : 'left';
        return this.dragBarPosition !== null ? htmlSafe(`${prop}: ${this.dragBarPosition}px;`) : null;
    }

    @dontRunInFastboot
    willDestroy() {
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragStop);
    }

    @action
    @dontRunInFastboot
    onDragStart(event: HTMLElementMouseEvent<HTMLDivElement>) {
        //TODO handle touchstart/touchmove/touchend events for mobile
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragStop);
        this.isDragging = true;
        this.dragBarOffset = getElementOffset(event.target);
    }

    @action
    onDragMove(event: MouseEvent) {
        if (this.orientation === 'horizontal') {
            const minY = this.minClientY;
            const maxY = document.body.offsetHeight - this.barThickness - this.maxClientY;
            const yOffset = Math.max(minY, Math.min(maxY, event.clientY));
            this.dragBarPosition = yOffset - (this.dragBarOffset?.top ?? 0);
        } else {
            const minX = this.minClientX;
            const maxX = document.body.offsetWidth - this.barThickness - this.maxClientX;
            const xOffset = Math.max(minX, Math.min(maxX, event.clientX));
            this.dragBarPosition = xOffset - (this.dragBarOffset?.left ?? 0);
        }
    }

    @action
    onDragStop(event: MouseEvent) {
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragStop);
        const endPosition = event.clientY - (this.dragBarOffset?.top ?? 0);
        this.isDragging = false;
        this.dragBarPosition = null;
        this.dragBarOffset = null;

        //TODO send an action here w/the new bar offset position
        if (this.mode !== 'fit') {
            this.args.setMode('fit');
        }

        this.fitHeight = Math.max(40, this.fitHeight - endPosition);
    }
}
