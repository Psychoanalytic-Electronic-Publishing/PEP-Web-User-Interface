import Ember from 'ember';

declare global {
    interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
    // interface Function extends Ember.FunctionPrototypeExtensions {}

    type HTMLElementEvent<T extends HTMLElement> = Event & {
        target: T;
        currentTarget: T;
    };

    type HTMLElementMouseEvent<T extends HTMLElement> = MouseEvent & {
        target: T;
        currentTarget: T;
    };
}

export {};
