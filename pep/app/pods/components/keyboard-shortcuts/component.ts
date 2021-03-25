import { action } from '@ember/object';
import Component from '@glimmer/component';

import tinykeys, { KeyBindingMap } from 'tinykeys';

export interface KeyboardShortcut {
    keys: string;
    shortcut: (event: KeyboardEvent) => void;
    options?: {
        allowInInput?: boolean;
    };
}
interface KeyboardShortcutsArgs {
    target: HTMLElement;
    shortcuts: KeyboardShortcut[];
}

export default class KeyboardShortcuts extends Component<KeyboardShortcutsArgs> {
    destroyMethod?: () => void;

    @action
    setupShortcuts(): void {
        const keyBindingMap = this.args.shortcuts.reduce<KeyBindingMap>((previous, current) => {
            if (!current.options?.allowInInput) {
                previous[current.keys] = (event: KeyboardEvent) => this.eventHandler(event, current.shortcut);
            } else {
                previous[current.keys] = current.shortcut;
            }

            return previous;
        }, {});
        this.destroyMethod = tinykeys(this.args.target ?? window, keyBindingMap);
    }

    willDestroy() {
        this.destroyMethod?.();
    }

    eventHandler(event: KeyboardEvent, callback: (event: KeyboardEvent) => void): void {
        const active = document.activeElement;
        const enteringText =
            active instanceof HTMLElement &&
            (active.isContentEditable || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!enteringText) {
            callback(event);
        }
    }
}
