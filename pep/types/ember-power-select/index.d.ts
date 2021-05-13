declare module 'ember-power-select/components/power-select/options';
declare module 'ember-power-select/components/power-select-multiple/trigger';

declare module 'ember-power-select/types/power-select-api' {
    export class PowerSelectAPI<T> {
        disabled: boolean;
        highlighted: T;
        isActive: boolean;
        isOpen: boolean;
        lastSearchedTexted: string;
        loading: boolean;
        options: T[];
        results: T[];
        resultsCount: number;
        searchText: string;
        selected: T | T[];
        uniqueId: string;
        actions: {
            choose(option: T): void;
            close(): void;
            highlight(option: T): void;
            open(): void;
            reposition(): void;
            scrollTo(option: T): void;
            search(term: string): void;
            select(option: T): void;
            toggle(): void;
        };
    }
}
