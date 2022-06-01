import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { ButtonArgs } from '@gavant/ember-button-basic/components/button';

import FastbootMediaService from 'pep/services/fastboot-media';

import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

interface ButtonWithTooltipArgs {
    label?: string;
    icon?: IconName;
    iconPrefix?: IconPrefix;
    iconSize?: ButtonArgs['iconSize'];
    type?: ButtonArgs['type'];
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

interface ButtonWithTooltipSignature {
    Args: ButtonWithTooltipArgs;
    Element: HTMLElement;
    Blocks: [];
}

export default class ButtonWithTooltip extends Component<ButtonWithTooltipSignature> {
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
     * Default tooltips to never show for buttons on mobile/tablet
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

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Button::WithTooltip': typeof ButtonWithTooltip;
    }
}
