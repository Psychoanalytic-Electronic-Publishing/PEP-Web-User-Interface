import Ember from 'ember';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import NotificationService from 'ember-cli-notifications/services/notifications';
import AjaxService from './ajax';
import ENV from 'pep/config/environment';
import LoadingBarService from './loading-bar';
import { later } from '@ember/runloop';
import PepSessionService from './pep-session';
import CookiesService from 'ember-cookies/services/cookies';
import { DISQUS_SSO_SESSION_COOKIE_NAME } from 'pep/constants/cookies';

// Used for testing
// https://developer.squareup.com/blog/the-ember-run-loop-and-asynchronous-testing/
let _asyncTaskToDo: (() => void) | null = null;

export function runNextAsyncTask() {
    // Used in testing
    // to manually call next recursive call
    _asyncTaskToDo && _asyncTaskToDo();
}

type DisuqsSSORequestKeys = 'SessionId';

interface DisqusSSOResponse {
    Payload: string;
    PublicKey: string;
    ReasonDescription: string;
    ReasonCode: number | null;
}

interface DisqusSSOSession {
    payload: string;
    publicKey: string;
}

export default class DisqusService extends Service.extend({}) {
    @service('pep-session') session!: PepSessionService;
    @service ajax!: AjaxService;
    @service notifications!: NotificationService;
    @service loadingBar!: LoadingBarService;
    @service cookies!: CookiesService;

    @tracked payload = '';
    @tracked publicKey = '';

    /**
     * Calculate the Disqus payload expiration timestamp in seconds
     */
    private calculateExpiration(payload: string): number {
        const tokenGenerated = parseInt(payload.split(' ')[2]);
        const tokenExpires = tokenGenerated + 60 * 60 * 2; // 2 hours

        return tokenExpires;
    }

    /**
     * Schedule a refresh of the Disqus SSO session
     */
    private scheduleRefresh(payload: string) {
        const tokenExpires = this.calculateExpiration(payload);

        const currentTime = (new Date().getTime() / 1000) | 0; // time in seconds

        const secondsUntilExpiration = tokenExpires - currentTime;

        const timeOffset = 60; // 1 minute
        const secondsUntilRefresh = secondsUntilExpiration - timeOffset;

        if (secondsUntilRefresh <= 0) return this.newSession(); // refresh immediately

        this.queueAsyncTask(() => {
            later(() => this.newSession(), secondsUntilRefresh * 1000); // time in ms
        });
    }

    /**
     * Save a Disqus SSO session in the browser cookies
     */
    private saveSession(payload: string, publicKey: string) {
        const stringValue = JSON.stringify({ payload, publicKey });

        const expiration = this.calculateExpiration(payload);

        this.cookies.write(DISQUS_SSO_SESSION_COOKIE_NAME, stringValue, {
            expires: new Date(expiration * 1000) // time in ms
        });
    }

    /**
     * Check if an existing Disqus SSO session is stored in the browser cookies
     */
    private existingSession(): boolean {
        return this.cookies.exists(DISQUS_SSO_SESSION_COOKIE_NAME);
    }

    /**
     * Loads an existing Disqus SSO session from the browser cookies
     */
    private loadExistingSession(): DisqusSSOSession | undefined {
        const stringValue = this.cookies.read(DISQUS_SSO_SESSION_COOKIE_NAME);

        if (!stringValue) return undefined;

        const { payload, publicKey }: DisqusSSOSession = JSON.parse(stringValue);

        this.payload = payload;
        this.publicKey = publicKey;

        this.scheduleRefresh(payload);
    }

    /**
     * Fetches a new Disqus SSO session
     */
    private async newSession() {
        if (!this.session.sessionId) return;

        const params: Record<DisuqsSSORequestKeys, string> = {
            SessionId: this.session.sessionId
        };

        const queryString = new URLSearchParams(params).toString();
        const SSOEndpoint = `${ENV.authBaseUrl}/Disqus?${queryString}`;

        const { Payload, PublicKey } = await this.ajax.request<DisqusSSOResponse>(SSOEndpoint);

        this.payload = Payload;
        this.publicKey = PublicKey;

        this.saveSession(Payload, PublicKey);

        this.scheduleRefresh(Payload);
    }

    /**
     * Setup Disqus SSO session.
     * Existing sessions are loaded from cookies when avaialble.
     */
    async setup() {
        try {
            this.loadingBar.show();

            if (this.existingSession()) {
                this.loadExistingSession();
                return;
            }

            await this.newSession();
        } catch (errors) {
            this.notifications.error(errors);
        } finally {
            this.loadingBar.hide();
        }
    }

    queueAsyncTask(taskToDo: (() => void) | null) {
        // if testing, save next work to do
        // so that we don't block the run loop
        if (Ember.testing) {
            _asyncTaskToDo = taskToDo;
        } else if (taskToDo) {
            taskToDo();
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        disqus: DisqusService;
    }
}
