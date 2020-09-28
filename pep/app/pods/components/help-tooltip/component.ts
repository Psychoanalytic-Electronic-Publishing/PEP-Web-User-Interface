import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import ModalService from '@gavant/ember-modals/services/modal';
import IntlService from 'ember-intl/services/intl';

import FastbootMediaService from 'pep/services/fastboot-media';

interface HelpTooltipArgs {
    tooltip: string;
    modalTitle?: string;
    forceModal?: boolean;
    tooltipClass?: string;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
    tooltipSpacing?: number;
    tooltipContainer?: string;
}

export default class HelpTooltip extends Component<HelpTooltipArgs> {
    @service fastbootMedia!: FastbootMediaService;
    @service modal!: ModalService;
    @service intl!: IntlService;

    modalBodyId: string = `help-tooltip-modal-body-${guidFor(this)}`;

    @computed('modal.current.path')
    get modalIsOpen() {
        return this.modal.current?.path === 'help-tooltip';
    }

    /**
     * On mobile devices, show the tooltip content in a modal-like display instead
     * of an actual tooltip. You can force the modal view to always show via `@forceModal`
     * @readonly
     * @returns {boolean}
     */
    get isModalView() {
        return this.args.forceModal || this.fastbootMedia.isSmallDevice;
    }

    get tooltipSide() {
        return this.args.tooltipSide ?? 'right';
    }

    get tooltipSpacing() {
        return this.args.tooltipSpacing ?? 5;
    }

    get tooltipContainer() {
        return this.args.tooltipContainer ?? 'body';
    }

    /**
     * Opens the help tooltip modal with the given content/title when the
     * content is clicked if modal view is active
     */
    @action
    onClick() {
        if (this.isModalView) {
            this.modal.open('help-tooltip', {
                bodyId: this.modalBodyId,
                title: this.args.modalTitle,
                content: this.args.tooltip
            });
        }
    }
}
