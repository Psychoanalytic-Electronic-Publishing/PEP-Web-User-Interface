import SourceVolume from 'pep/pods/source-volume/model';
import RowSelection from 'pep/services/row-selection';

export default class BrowseSelection extends RowSelection<SourceVolume> {}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'browse-selection': BrowseSelection;
    }
}
