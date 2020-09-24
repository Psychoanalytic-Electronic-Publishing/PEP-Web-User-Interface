import Component from '@glimmer/component';

interface ButtonWithTooltipArgs {
    label?: string;
    icon?: string;
    iconSize?: string;
    type?: string;
    action: () => void;
    containerClass?: string;
    title?: string;
    tooltip: string;
    tooltipClass?: string;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
    tooltipSpacing?: number;
    tooltipEffect?: 'fade' | 'slide' | 'none';
    tooltipContainer?: string;
    tooltipVisible?: boolean;
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

    get tooltipContainer() {
        return this.args.tooltipContainer ?? 'body';
    }

    get tooltipVisible() {
        return this.args.tooltipVisible ?? true;
    }
}
