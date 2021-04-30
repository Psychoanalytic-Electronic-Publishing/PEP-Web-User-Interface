import Component from '@glint/environment-ember-loose/ember-component';

import { TinymceEditorArgs } from '@gavant/ember-tinymce/components/tinymce-editor';
import { BaseGlimmerSignature, ModifyYields } from '@gavant/glint-template-types/utils/types';

interface TinymceEditorYields {
    Yields: {
        loading: [];
    };
}

export default class TinymceEditor extends Component<
    ModifyYields<BaseGlimmerSignature<TinymceEditorArgs>, TinymceEditorYields>
> {}
