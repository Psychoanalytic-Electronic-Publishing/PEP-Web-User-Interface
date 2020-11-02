import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Modal from '@gavant/ember-modals/services/modal';

import { SEARCH_DEFAULT_VIEW_PERIOD } from 'pep/constants/search';
import GlossaryTerm from 'pep/pods/glossary-term/model';

interface ModalDialogsDocumentImageArgs {
    onClose: () => void;
    options: {
        id: string;
        url: string;
        caption: string;
    };
}

export default class ModalDialogsDocumentImage extends Component<ModalDialogsDocumentImageArgs> {}
