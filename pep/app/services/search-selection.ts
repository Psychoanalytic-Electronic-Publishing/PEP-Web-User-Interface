import RowSelection from 'pep/services/row-selection';

export default class SearchSelection extends RowSelection {}
// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'search-selection': SearchSelection;
    }
}
