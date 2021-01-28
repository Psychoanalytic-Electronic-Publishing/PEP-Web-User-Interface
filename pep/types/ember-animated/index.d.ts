declare module 'ember-animated' {
    export interface Sprite {
        startAtPixel: (options: { y: number }) => void;
        endAtPixel: (options: { y: number }) => void;
        startTranslatedBy: (dx: number, dy: number) => void;
        endTranslatedBy: (dx: number, dy: number) => void;
    }

    export interface TransitionArgs {
        keptSprites: Sprite[];
        removedSprites: Sprite[];
        insertedSprites: Sprite[];
    }
}
