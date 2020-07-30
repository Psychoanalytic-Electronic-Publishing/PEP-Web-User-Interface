declare module 'ember-animated' {
    export interface Sprite {
        startTranslatedBy: (dx: number, dy: number) => void;
        endTranslatedBy: (dx: number, dy: number) => void;
    }

    export interface TransitionArgs {
        keptSprites: Sprite[];
        removedSprites: Sprite[];
        insertedSprites: Sprite[];
    }
}
