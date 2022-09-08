interface DropdownActions {
    toggle: (e?: Event) => void;
    close: (e?: Event, skipFocus?: boolean) => void;
    open: (e?: Event) => void;
    reposition: (...args: any[]) => undefined;
}

import { DropdownContent } from '@gavant/glint-template-types/types/ember-basic-dropdown/content';
import { DropdownTrigger } from '@gavant/glint-template-types/types/ember-basic-dropdown/trigger';

import { WithBoundArgs } from '@glint/template';

declare module 'ember-basic-dropdown/dropdown' {
    export interface BasicDropdownAPI {
        uniqueId: string;
        isOpen: boolean;
        disabled: boolean;
        actions: DropdownActions;
        Trigger: WithBoundArgs<typeof DropdownTrigger, 'dropdown' | 'hPosition' | 'renderInPlace' | 'vPosition'>;
        Content: WithBoundArgs<
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
}
