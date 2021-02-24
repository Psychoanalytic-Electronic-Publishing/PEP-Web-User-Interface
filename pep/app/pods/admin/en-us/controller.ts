import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';

import { TinymceEditorPlugins } from '@gavant/ember-tinymce/components/tinymce-editor';

export default class AdminEnUs extends Controller {
    @tracked changeset?: BufferedChangeset;
    plugins: string[] = [
        TinymceEditorPlugins.ADV_LIST,
        TinymceEditorPlugins.EMOTICONS,
        TinymceEditorPlugins.HORIZONTAL_RULE,
        TinymceEditorPlugins.IMAGE,
        TinymceEditorPlugins.LINK,
        TinymceEditorPlugins.LISTS,
        TinymceEditorPlugins.PASTE,
        TinymceEditorPlugins.TABLE,
        TinymceEditorPlugins.TABLE_OF_CONTENTS,
        TinymceEditorPlugins.WORD_COUNT
    ];
    toolbar: string[] = [
        'bold italic | bullist numlist | hr | image | link openlink unlink | pastetext | table | emoticons'
    ];

    @action
    save() {
        this.changeset?.save();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/en-us': AdminEnUs;
    }
}
