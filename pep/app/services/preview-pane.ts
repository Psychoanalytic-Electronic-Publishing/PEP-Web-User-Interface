import { action } from '@ember/object';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export enum SearchPreviewModeId {
    MINIMIZED = 'minimized',
    MAXIMIZED = 'maximized',
    FIT = 'fit',
    CUSTOM = 'custom'
}
export interface SearchPreviewMode {
    id: SearchPreviewModeId;
    options?: {
        height: number;
    };
}

export default class PreviewPane extends Service {
    @tracked mode: SearchPreviewMode = {
        id: SearchPreviewModeId.FIT
    };

    /**
     * Update the search preview pane mode and persist it across all instances
     *
     * @param {SearchPreviewMode} mode
     * @memberof PreviewPane
     */
    @action
    updateMode(mode: SearchPreviewMode): void {
        this.mode = mode;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'preview-pane': PreviewPane;
    }
}
