import Component from '@glint/environment-ember-loose/glimmer-component';

import { TinymceEditorPlugins } from '@gavant/ember-tinymce/components/tinymce-editor';
import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import Env from 'pep/config/environment';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface AdminEditorArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
}

export default class AdminEditor<T> extends Component<BaseGlimmerSignature<AdminEditorArgs<T>>> {
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
        TinymceEditorPlugins.WORD_COUNT,
        TinymceEditorPlugins.CODE
    ];
    toolbar: string[] = [
        'bold italic | bullist numlist | hr | image | link openlink unlink | pastetext | table | emoticons | code'
    ];
    baseUrl = `${Env.assetBaseUrl}@gavant/ember-tinymce`;
}
