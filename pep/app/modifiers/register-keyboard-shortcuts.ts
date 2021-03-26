import { modifier } from 'ember-modifier';

import tinykeys, { KeyBindingMap } from 'tinykeys';

const eventHandler = (event: KeyboardEvent, callback: (event: KeyboardEvent) => void) => {
    const active = document.activeElement;
    const enteringText = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active?.tagName ?? '');
    if (!enteringText) {
        callback(event);
    }
};

export interface KeyboardShortcut {
    keys: string;
    shortcut: (event: KeyboardEvent) => void;
    options?: {
        allowInInput?: boolean;
    };
}

interface KeyboardShortcutsArgs {
    target?: HTMLElement;
    shortcuts?: KeyboardShortcut[];
}

export default modifier((_element, _args, named: KeyboardShortcutsArgs) => {
    const keyBindingMap = named.shortcuts?.reduce<KeyBindingMap>((previous, current) => {
        if (!current.options?.allowInInput) {
            previous[current.keys] = (event: KeyboardEvent) => eventHandler(event, current.shortcut);
        } else {
            previous[current.keys] = current.shortcut;
        }

        return previous;
    }, {});
    const destroyMethod = tinykeys(named.target ?? window, keyBindingMap ?? {});

    return () => {
        destroyMethod?.();
    };
});
