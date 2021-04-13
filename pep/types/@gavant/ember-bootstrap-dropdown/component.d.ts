import { ComponentWithBoundArgs } from '@glint/environment-ember-loose';
import Component from '@glint/environment-ember-loose/glimmer-component';
import { Dropdown, DropdownActions } from 'ember-basic-dropdown/addon/components/basic-dropdown';
import { CalculatePosition } from 'ember-basic-dropdown/addon/utils/calculate-position';

import { DropdownActionArgs } from '@gavant/ember-bootstrap-dropdown/addon/components/dropdown-action';
import { DropdownLinkArgs } from '@gavant/ember-bootstrap-dropdown/addon/components/dropdown-link';

import { BaseGlimmerSignature, ModifyYields } from 'pep/utils/types';

export interface DropdownTriggerArgs {
    dropdown: Dropdown;
    eventType: 'click' | 'mousedown';
    stopPropagation: boolean;
    hPosition: string;
    renderInPlace: boolean;
    vPosition: string;
    htmlTag?: string;
    onBlur?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onClick?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    onFocus?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onFocusIn?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onFocusOut?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onKeyDown?: (dropdown?: Dropdown, event?: KeyboardEvent) => void;
    onMouseDown?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    onMouseEnter?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    onMouseLeave?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    onTouchEnd?: (dropdown?: Dropdown, event?: TouchEvent) => void;
}

export declare class DropdownTrigger extends Component<BaseGlimmerSignature<DropdownTriggerArgs>> {}

export interface DropdownContentArgs {
    transitioningInClass?: string;
    transitionedInClass?: string;
    transitioningOutClass?: string;
    isTouchDevice?: boolean;
    destination: string;
    dropdown: Dropdown;
    hPosition: string;
    vPosition: string;
    renderInPlace: boolean;
    preventScroll?: boolean;
    rootEventType: 'click' | 'mousedown';
    top: string | undefined;
    left: string | undefined;
    right: string | undefined;
    width: string | undefined;
    height: string | undefined;
    otherStyles: Record<string, string>;
    onFocusIn?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onFocusOut?: (dropdown?: Dropdown, event?: FocusEvent) => void;
    onMouseEnter?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    onMouseLeave?: (dropdown?: Dropdown, event?: MouseEvent) => void;
    shouldReposition?: (mutations: MutationRecord[], dropdown: Dropdown) => boolean;
}

export declare class DropdownContent extends Component<BaseGlimmerSignature<DropdownContentArgs>> {}

export interface DropdownMenuArgs {
    initiallyOpened?: boolean;
    renderInPlace?: boolean;
    verticalPosition?: string;
    horizontalPosition?: string;
    destination?: string;
    disabled?: boolean;
    dropdownId?: string;
    matchTriggerWidth?: boolean;
    onInit?: Function;
    registerAPI?: Function;
    onOpen?: Function;
    onClose?: Function;
    calculatePosition?: CalculatePosition;
}

interface DropdownMenuYield {
    Yields: {
        default: [
            {
                uniqueId: string;
                isOpen: boolean;
                disabled: boolean;
                actions: DropdownActions;
                Trigger: ComponentWithBoundArgs<
                    typeof DropdownTrigger,
                    'dropdown' | 'hPosition' | 'renderInPlace' | 'vPosition'
                >;
                Content: ComponentWithBoundArgs<
                    typeof DropdownContent,
                    | 'dropdown'
                    | 'hPosition'
                    | 'renderInPlace'
                    | 'preventScroll'
                    | 'rootEventType'
                    | 'vPosition'
                    | 'destination'
                    | 'top'
                    | 'left'
                    | 'right'
                    | 'width'
                    | 'height'
                    | 'otherStyles'
                >;
            }
        ];
    };
}

export declare class DropdownMenu extends Component<
    ModifyYields<BaseGlimmerSignature<DropdownMenuArgs>, DropdownMenuYield>
> {}

export interface DDActionArgs extends Omit<DropdownActionArgs, 'dd'> {
    dd: Dropdown;
}

export interface DDLinkArgs extends Omit<DropdownLinkArgs, 'dd'> {
    dd: Dropdown;
}
export declare class DropdownAction extends Component<BaseGlimmerSignature<DDActionArgs>> {}
export declare class DropdownLink extends Component<BaseGlimmerSignature<DDLinkArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        DropdownMenu: typeof DropdownMenu;
        DropdownAction: typeof DropdownAction;
        DropdownLink: typeof DropdownLink;
    }
}
