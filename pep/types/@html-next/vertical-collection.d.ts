import ArrayProxy from '@ember/array/proxy';

import Component from '@glint/environment-ember-loose/ember-component';

export interface VerticalCollectionArgs<T> {
    items: ArrayProxy<T> | T[];
    tagName?: string;
    key?: string;
    estimateHeight: number;
    staticHeight?: number;
    shouldRecycle?: boolean;
    containerSelector?: string;
    bufferSize?: number;
    idForFirstItem?: string;
    renderFromLast?: boolean;
    renderAll?: boolean;
    lastReached?: () => void;
    firstReached?: () => void;
    lastVisibleChanged?: () => void;
    firstVisibleChanged?: () => void;
}

export interface VerticalCollectionSignature<T> {
    Element: HTMLElement;
    Args: VerticalCollectionArgs<T>;
    Yields: {
        default: [T];
        else: [];
    };
}

export default class VerticalCollection<T> extends Component<VerticalCollectionSignature<T>> {}
