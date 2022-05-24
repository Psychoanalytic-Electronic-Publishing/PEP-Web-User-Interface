import '@glint/environment-ember-loose/native-integration';
import '@glint/environment-ember-loose/registry';
import Ember from 'ember';
import DS from 'ember-data';

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
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

export {};
