import RowSelection from 'pep/services/row-selection';

export default class BrowseSelection extends RowSelection {}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'browse-selection': BrowseSelection;
    }
}
