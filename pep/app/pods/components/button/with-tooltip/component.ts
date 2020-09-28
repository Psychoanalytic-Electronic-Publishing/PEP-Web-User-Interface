import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import FastbootMediaService from 'pep/services/fastboot-media';

interface ButtonWithTooltipArgs {
    label?: string;
    icon?: string;
    iconSize?: string;
    type?: string;
    action: () => void;
    containerClass?: string;
    tooltip: string;
    tooltipClass?: string;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
    tooltipSpacing?: number;
    tooltipEffect?: 'fade' | 'slide' | 'none';
    tooltipContainer?: string;
    tooltipVisible?: boolean;
}

export default class ButtonWithTooltip extends Component<ButtonWithTooltipArgs> {
    @service fastbootMedia!: FastbootMediaService;

    get tooltipSide() {
        return this.args.tooltipSide ?? 'bottom';
    }

    get tooltipSpacing() {
        return this.args.tooltipSpacing ?? 5;
    }

    get tooltipEffect() {
        return this.args.tooltipEffect ?? 'slide';
    }

    get tooltipContainer() {
        return this.args.tooltipContainer ?? 'body';
    }

    /**
     * Default tooltips to never show on buttons on mobile/tablet
     * since in order for the tooltip to show, on touch devices you
     * must tap the button and therefore invoke its action to see
     * the tooltip, making it mostly useless.
     *
     * When the tooltip is NOT visible, the `@tooltip` text will
     * be applied to the title attr instead (this can be overriden
     * by passing in a custom title="..." attribute)
     *
     * @readonly
     * @returns {boolean}
     */
    get tooltipVisible() {
        return this.args.tooltipVisible ?? this.fastbootMedia.isLargeDevice;
    }
}
