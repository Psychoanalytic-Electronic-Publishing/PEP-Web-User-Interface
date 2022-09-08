import Component from '@ember/component';

import { TinymceEditorArgs } from '@gavant/ember-tinymce/components/tinymce-editor';
import { BaseGlimmerSignature } from '@gavant/glint-template-types/utils/types';

import { ModifyBlocks } from 'pep/utils/types';

interface TinymceEditorBlocks {
    Blocks: {
        loading: [];
    };
}

export default class TinymceEditor extends Component<
    ModifyBlocks<BaseGlimmerSignature<TinymceEditorArgs>, TinymceEditorBlocks>
> {}
