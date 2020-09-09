declare module 'ember-simple-auth/mixins/data-adapter-mixin' {
    import EmberObject from '@ember/object';
    import Session from 'pep/services/pep-session';

    export default class DataAdapterMixin extends EmberObject {
        session: Session;
        authorizer: null;

        ajaxOptions(url: string, type: string, options?: object | undefined): {};
        headersForRequest(): {};
        handleResponse(status: number, headers: {}, payload: {}, requestData: {}): {};
        ensureResponseAuthorized(status: number, headers: {}, payload: {}, requestData: {}): void;
    }
}
