import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { DS } from 'ember-data';

import ModalService from '@gavant/ember-modals/services/modal';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Abstract from 'pep/pods/abstract/model';
import AuthService from 'pep/services/auth';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import PreviewPaneService, { SearchPreviewMode, SearchPreviewModeId } from 'pep/services/preview-pane';
import ScrollableService from 'pep/services/scrollable';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface DraggableContainerArgs {
    maxHeight?: number;
    resultId?: string;
    height?: number;
    close?: () => void;
    loadDocument?: (abstract: Abstract) => void;
}

export default class DraggableContainer extends Component<BaseGlimmerSignature<DraggableContainerArgs>> {
    @service('pep-session') session!: PepSessionService;
    @service declare auth: AuthService;
    @service declare router: RouterService;
    @service declare scrollable: ScrollableService;
    @service declare loadingBar: LoadingBarService;
    @service declare store: DS.Store;
    @service declare modal: ModalService;

    @tracked fitHeight: number = 0;
    @tracked isDragResizing: boolean = false;
    @tracked result?: Abstract;
    @tracked mode: { id: SearchPreviewModeId; options?: any } = {
        id: SearchPreviewModeId.FIT
    };

    innerElement: HTMLElement | null = null;
    scrollableElement: HTMLElement | null = null;
    minFitHeight: number = 40;
    startingDragHeight: number = 0;

    get isFitMode() {
        return this.mode.id === SearchPreviewModeId.FIT;
    }

    get isCustomMode() {
        return this.mode.id === SearchPreviewModeId.CUSTOM;
    }

    get isMinimizedMode() {
        return this.mode.id === SearchPreviewModeId.MINIMIZED;
    }

    get styles() {
        return (this.isFitMode || this.isCustomMode) && this.adjustedFitHeight
            ? htmlSafe(`height: ${this.adjustedFitHeight}px;`)
            : null;
    }

    get adjustedFitHeight() {
        return Math.min(this.fitHeight, this.args.maxHeight ?? this.fitHeight);
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
     * Saves a reference to the <Scrollable>'s element
     * @param {HTMLElement} element
     */
    @action
    onScrollableInsert(element: HTMLElement) {
        this.scrollableElement = element;
    }

    /**
     * Set inner element and load the abstract
     * @param {HTMLElement} element
     */
    @action
    async onElementInsert(element: HTMLElement) {
        this.innerElement = element;
    }

    /**
     * Sets the preview pane's sizing mode
     * @param {SearchPreviewModeId} mode
     */
    @action
    setMode(mode: SearchPreviewModeId) {
        const previewMode: SearchPreviewMode = { id: mode };
        // reset the calculated fit size in case it was resized
        if (mode === SearchPreviewModeId.FIT) {
            this.updateFitHeight();
        } else if (mode === SearchPreviewModeId.CUSTOM) {
            previewMode.options = {
                height: this.fitHeight
            };
        }

        this.mode = previewMode;
    }

    /**
     * Closes the preview pane
     */
    @action
    close() {
        this.args.close?.();
        this.fitHeight = 0;
    }

    /**
     * When drag resizing starts, set the pane to not animate height changes
     */
    @action
    onDragStart() {
        if (!this.isCustomMode && this.scrollableElement) {
            this.fitHeight = this.scrollableElement.offsetHeight;
            this.mode = {
                id: SearchPreviewModeId.CUSTOM,
                options: {
                    height: this.fitHeight
                }
            };
        }

        this.startingDragHeight = this.fitHeight;
        this.isDragResizing = true;
    }

    /**
     * While drag resizing, resizes the pane to match the current size
     */
    @action
    onDragMove(position: number) {
        this.fitHeight = Math.max(this.minFitHeight, this.startingDragHeight - position);
    }

    /**
     * When drag resizing ends, update the pane with the new height
     * @param {number} position
     */
    @action
    onDragEnd(position: number) {
        this.fitHeight = Math.max(this.minFitHeight, this.startingDragHeight - position);
        this.startingDragHeight = 0;
        next(this, () => (this.isDragResizing = false));

        this.mode = {
            id: SearchPreviewModeId.CUSTOM,
            options: {
                height: this.fitHeight
            }
        };
    }
}
