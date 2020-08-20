import Component from '@glimmer/component';

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
}

export default class ButtonWithTooltip extends Component<ButtonWithTooltipArgs> {
    get tooltipSide() {
        return this.args.tooltipSide ?? 'bottom';
    }

    get tooltipSpacing() {
        return this.args.tooltipSpacing ?? 5;
    }

    get tooltipEffect() {
        return this.args.tooltipEffect ?? 'slide';
    }
}
