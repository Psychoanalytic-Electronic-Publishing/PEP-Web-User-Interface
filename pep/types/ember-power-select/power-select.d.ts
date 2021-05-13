import Component from '@glint/environment-ember-loose/glimmer-component';
import { PowerSelectAPI } from 'ember-power-select/types/power-select-api';

import { BaseGlimmerSignature, ModifyYields } from 'pep/utils/types';

export interface PromiseProxy<T> extends Promise<T> {
    content: any;
}
export type MatcherFn = (option: any, text: string) => number;
interface PowerSelectArgs<T> {
    highlightOnHover?: boolean;
    placeholderComponent?: string;
    searchMessage?: string;
    noMatchesMessage?: string;
    matchTriggerWidth?: boolean;
    options: T[] | Promise<T[]>;
    selected: T | Promise<T>;
    closeOnSelect?: boolean;
    defaultHighlighted?: any;
    searchField?: string;
    searchEnabled?: boolean;
    tabindex?: number | string;
    triggerComponent?: string;
    matcher?: MatcherFn;
    initiallyOpened?: boolean;
    typeAheadOptionMatcher?: MatcherFn;
    placeholder?: string;
    searchPlaceholder?: string;
    renderInPlace?: boolean;
    disabled?: boolean;
    loadingMessage?: boolean;
    canLoadMore?: boolean;
    allowClear?: boolean;
    triggerClass?: string;
    dropdownClass?: string;
    optionsComponent?: string;
    beforeOptionsComponent?: string;
    extra?: any;
    loadMore?: (keyword?: string) => Promise<T[]>;
    buildSelection?: (selected: any, select: PowerSelectAPI<T>) => any;
    onChange: (selection: any, select: PowerSelectAPI<T>, event?: Event) => void;
    search?: (term: string, select: PowerSelectAPI<T>) => any[] | Promise<T[]>;
    onOpen?: (select: PowerSelectAPI<T>, e: Event) => boolean | undefined;
    onClose?: (select: PowerSelectAPI<T>, e: Event) => boolean | undefined;
    onInput?: (term: string, select: PowerSelectAPI<T>, e: Event) => string | false | void;
    onKeydown?: (select: PowerSelectAPI<T>, e: KeyboardEvent) => boolean | undefined;
    onFocus?: (select: PowerSelectAPI<T>, event: FocusEvent) => void;
    onBlur?: (select: PowerSelectAPI<T>, event: FocusEvent) => void;
    scrollTo?: (option: any, select: PowerSelectAPI<T>) => void;
    registerAPI?: (select: PowerSelectAPI<T>) => void;
}

interface PowerSelectYields<T> {
    Yields: {
        default: [T, PowerSelectAPI<T>];
    };
}

export declare class PowerSelectComponent<T> extends Component<
    ModifyYields<BaseGlimmerSignature<PowerSelectArgs<T>>, PowerSelectYields<T>>
> {}
// export declare class PowerSelectComponent<T> extends Component<PowerSelectSignature<T>> {}
declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        PowerSelect: typeof PowerSelectComponent;
    }
}
