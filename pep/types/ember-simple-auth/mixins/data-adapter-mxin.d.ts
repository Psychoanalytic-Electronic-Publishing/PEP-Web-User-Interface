declare module 'ember-simple-auth/mixins/data-adapter-mixin' {
import EmberObject from '@ember/object';

import PepSessionService from 'pep/services/pep-session';

        export default class DataAdapterMixin extends EmberObject {
        session: PepSessionService;
        authorizer: null;

        ajaxOptions(url: string, type: string, options?: Record<string, unknown> | undefined): Record<string, unknown>;
        headersForRequest(): Record<string, unknown>;
        handleResponse(
            status: number,
            headers: Record<string, unknown>,
            payload: Record<string, unknown>,
            requestData: Record<string, unknown>
        ): Record<string, unknown>;
        ensureResponseAuthorized(
            status: number,
            headers: Record<string, unknown>,
            payload: Record<string, unknown>,
            requestData: Record<string, unknown>
        ): void;
    }
}
