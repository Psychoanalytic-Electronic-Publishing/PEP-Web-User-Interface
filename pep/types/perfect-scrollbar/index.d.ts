interface PerfectScrollbarOptions {
    handlers?: string[];
    wheelSpeed?: number;
    wheelPropagation?: boolean;
    swipeEasing?: boolean;
    minScrollbarLength?: number;
    maxScrollbarLength?: number;
    scrollingThreshold?: number;
    useBothWheelAxes?: boolean;
    suppressScrollX?: boolean;
    suppressScrollY?: boolean;
    scrollXMarginOffset?: number;
    scrollYMarginOffset?: number;
}

declare class PerfectScrollbar {
    constructor(element: HTMLElement, options: PerfectScrollbarOptions);
    update(): void;
    destroy(): void;
}
