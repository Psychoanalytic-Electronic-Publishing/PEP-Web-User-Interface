import Component from '@glimmer/component';
import Biblio from 'pep/pods/biblio/model';

interface BibliographyArgs {
    data: Biblio[];
}

export default class Bibliography extends Component<BibliographyArgs> {}
