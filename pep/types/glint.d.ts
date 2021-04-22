import FaIconComponent from '@gavant/glint-template-types/types/@fortawesome/ember-fontawesome/fa-icon';
import DropdownAction from '@gavant/glint-template-types/types/@gavant/ember-bootstrap-dropdown/dropdown-action';
import DropdownLink from '@gavant/glint-template-types/types/@gavant/ember-bootstrap-dropdown/dropdown-link';
import ButtonComponent from '@gavant/glint-template-types/types/@gavant/ember-button-basic/component';
import ButtonSpinnerComponent from '@gavant/glint-template-types/types/@gavant/ember-button-spinner/component';
import ModalDialog from '@gavant/glint-template-types/types/@gavant/gavant-ember-modals/modal-dialog';
import Dropdown from '@gavant/glint-template-types/types/ember-basic-dropdown/dropdown';
import TranslationHelper from '@gavant/glint-template-types/types/ember-intl/translation-helper';
import DidInsertModifier from '@gavant/glint-template-types/types/ember-render-modifiers/did-insert';
import DidUpdateModifier from '@gavant/glint-template-types/types/ember-render-modifiers/did-update';
import And from '@gavant/glint-template-types/types/ember-truth-helpers/and';
import Eq from '@gavant/glint-template-types/types/ember-truth-helpers/eq';
import Not from '@gavant/glint-template-types/types/ember-truth-helpers/not';
import Or from '@gavant/glint-template-types/types/ember-truth-helpers/or';

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'did-insert': typeof DidInsertModifier;
        'did-update': typeof DidUpdateModifier;
        FaIcon: typeof FaIconComponent;
        'fa-icon': typeof FaIconComponent;
        Dropdown: typeof Dropdown;
        DropdownMenu: typeof Dropdown;
        DropdownAction: typeof DropdownAction;
        DropdownLink: typeof DropdownLink;
        ButtonSpinner: typeof ButtonSpinnerComponent;
        Button: typeof ButtonComponent;
        t: typeof TranslationHelper;
        ModalDialog: typeof ModalDialog;
        and: typeof And;
        eq: typeof Eq;
        or: typeof Or;
        not: typeof Not;
    }
}
