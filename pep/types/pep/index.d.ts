import Component from '@glint/environment-ember-loose/ember-component';
import '@glint/environment-ember-loose/registry';
import Ember from 'ember';
import DS from 'ember-data';

import {
    FlipProp, IconName, IconPrefix, PullProp, RotateProp, SizeProp, Transform
} from '@fortawesome/fontawesome-svg-core';

declare global {
    interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
    // interface Function extends Ember.FunctionPrototypeExtensions {}

    type ModelWithName = DS.Model & { modelName: string };

    type HTMLElementEvent<T extends HTMLElement> = Event & {
        target: T;
        currentTarget: T;
    };

    type HTMLElementMouseEvent<T extends HTMLElement> = MouseEvent & {
        target: T;
        currentTarget: T;
    };

    type HTMLElementTouchEvent<T extends HTMLElement> = TouchEvent & {
        target: T;
        currentTarget: T;
    };

    type HTMLElementKeyboardEvent<T extends HTMLElement> = KeyboardEvent & {
        target: T;
        currentTarget: T;
    };
}

export {};

export interface FaIconComponentSignature {
    Element: SVGElement;
    Args: {
        icon: IconName;
        prefix?: IconPrefix;
        size?: SizeProp;
        rotation?: RotateProp;
        pull?: PullProp;
        pulse?: boolean;
        border?: boolean;
        flip?: FlipProp;
        fixedWidth?: boolean;
        transform?: Transform;
        symbol?: boolean;
    };
}

export class FaIconComponent extends Component<FaIconComponentSignature> {}
