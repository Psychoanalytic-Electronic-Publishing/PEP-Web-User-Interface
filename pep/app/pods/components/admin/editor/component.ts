import Component from '@glimmer/component';

import { TinymceEditorPlugins } from '@gavant/ember-tinymce/components/tinymce-editor';
import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

interface AdminEditorArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
}

export default class AdminEditor<T> extends Component<AdminEditorArgs<T>> {
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
    baseUrl = '/assets/';
}
