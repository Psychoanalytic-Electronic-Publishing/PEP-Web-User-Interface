import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DisqusService, { runNextAsyncTask } from 'pep/services/disqus';
import ENV from 'pep/config/environment';
import Service from '@ember/service';
import { DISQUS_SSO_SESSION_COOKIE_NAME } from 'pep/constants/cookies';
import sinon from 'sinon';

module('Unit | Service | Disqus', function (hooks) {
    setupTest(hooks);

    const now = new Date();

    const MOCK_SESSION_ID = 'f4f8b114-c913-4349-abdb-86c83465e937';

    class MockPepSessionService extends Service {
        get sessionId() {
            return MOCK_SESSION_ID;
        }
    }

    const MOCK_ENDPOINT_RESPONSE = {
        Payload: `yJpZCI6IjUwMDAwMyIsInVzZXJuYW1lIjoiVGVzdDMiLCJlbWFpbCI6IlBhRFNUZXN0M0B6ZWRyYS5uZXQiLCJhdmF0YXIiOiIiLCJ1cmwiOiIifQ== 28B2C29D405DD6628DDA39E61EE3C592E1AB03B8 ${
            (new Date().getTime() / 1000) | 0
        }`,
        PublicKey: 'Bmta7QuQ7BQm257aNvD0SVdyJJG06hJyXYR0Z9f1T9AUQkIKl9ScKMKUabOuLZxk',
        ReasonDescription: null,
        ReasonCode: 200
    };

    class MockAjaxService extends Service {
        requests: string[] = [];

        // The Disqus serivce only makes a single HTTP request. No need to overcomplicate
        async request(url: string) {
            this.requests.push(url);

            return MOCK_ENDPOINT_RESPONSE;
        }
    }

    class MockCookiesService extends Service {
        cookies: Record<string, string> = {};

        read(key: string): string {
            return this.cookies[key] || '';
        }

        write(key: string, value: string) {
            this.cookies[key] = value;
        }

        exists(key: string) {
            return key in this.cookies;
        }
    }

    const SESSION_COOKIE_STRING = JSON.stringify({
        payload: MOCK_ENDPOINT_RESPONSE.Payload,
        publicKey: MOCK_ENDPOINT_RESPONSE.PublicKey
    });

    hooks.beforeEach(function () {
        this.owner.register('service:pep-session', MockPepSessionService);
        this.owner.register('service:ajax', MockAjaxService);
        this.owner.register('service:cookies', MockCookiesService);
    });

    test('fetches SSO session data from PaDS and stores in state / cookies', async function (assert) {
        const ajaxMock = this.owner.lookup('service:ajax') as MockAjaxService;
        const cookiesMock = this.owner.lookup('service:cookies') as MockCookiesService;

        const service = this.owner.lookup('service:disqus') as DisqusService;

        await service.setup();

        // Makes a request to the payload endpoint
        const SSO_REQUEST_URL = `${ENV.authBaseUrl}/Disqus?SessionId=${MOCK_SESSION_ID}`;
        assert.equal(ajaxMock.requests[0], SSO_REQUEST_URL);

        // Stores session response data in state
        assert.equal(service.publicKey, MOCK_ENDPOINT_RESPONSE.PublicKey);
        assert.equal(service.payload, MOCK_ENDPOINT_RESPONSE.Payload);

        // Stores session in cookies
        assert.equal(cookiesMock.read(DISQUS_SSO_SESSION_COOKIE_NAME), SESSION_COOKIE_STRING);
    });

    test('uses SSO session from cookies instead of making a network request', async function (assert) {
        const ajaxMock = this.owner.lookup('service:ajax') as MockAjaxService;
        const cookiesMock = this.owner.lookup('service:cookies') as MockCookiesService;

        cookiesMock.write(DISQUS_SSO_SESSION_COOKIE_NAME, SESSION_COOKIE_STRING);

        const service = this.owner.lookup('service:disqus') as DisqusService;

        await service.setup();

        // Does not make a request to PaDS
        assert.equal(ajaxMock.requests.length, 0);

        // Loads session state from cookies
        assert.equal(service.publicKey, MOCK_ENDPOINT_RESPONSE.PublicKey);
        assert.equal(service.payload, MOCK_ENDPOINT_RESPONSE.Payload);
    });

    test('immediately requests a new session when an already expired session is loaded', async function (assert) {
        const ajaxMock = this.owner.lookup('service:ajax') as MockAjaxService;
        const cookiesMock = this.owner.lookup('service:cookies') as MockCookiesService;

        const EXPIRED_PAYLOAD = 'abc xyz 123456';
        const EXPIRED_SESSION_COOKIE_STRING = JSON.stringify({
            payload: EXPIRED_PAYLOAD, // payload with expired timestamp
            publicKey: MOCK_ENDPOINT_RESPONSE.PublicKey
        });

        cookiesMock.write(DISQUS_SSO_SESSION_COOKIE_NAME, EXPIRED_SESSION_COOKIE_STRING);

        const service = this.owner.lookup('service:disqus') as DisqusService;

        await service.setup();

        // Makes a request to PaDS for a new session
        assert.equal(ajaxMock.requests.length, 1);

        // New SSO session stored in state instead of one from cookies
        assert.equal(service.payload, MOCK_ENDPOINT_RESPONSE.Payload);
    });

    test('requests a new session when a session expires AFTER being loaded from cookies', async function (assert) {
        const clock = sinon.useFakeTimers(now.getTime());

        const ajaxMock = this.owner.lookup('service:ajax') as MockAjaxService;
        const cookiesMock = this.owner.lookup('service:cookies') as MockCookiesService;

        cookiesMock.write(DISQUS_SSO_SESSION_COOKIE_NAME, SESSION_COOKIE_STRING);

        const service = this.owner.lookup('service:disqus') as DisqusService;

        await service.setup();

        // Not yet made a request to PaDS
        assert.equal(ajaxMock.requests.length, 0);

        // Release the queued call for experiation timeout
        // https://developer.squareup.com/blog/the-ember-run-loop-and-asynchronous-testing/
        runNextAsyncTask();

        // Fast-forward to expiration
        clock.next();

        // Has now made a request to PaDS for a new SSO session
        assert.equal(ajaxMock.requests.length, 1);

        clock.restore();
    });

    test('requests a new session when a session retreived from the API expires', async function (assert) {
        const clock = sinon.useFakeTimers(now.getTime());

        const ajaxMock = this.owner.lookup('service:ajax') as MockAjaxService;

        const service = this.owner.lookup('service:disqus') as DisqusService;

        await service.setup();

        // Request the initial session
        assert.equal(ajaxMock.requests.length, 1);

        // Release the queued later call for experiation timeout
        // https://developer.squareup.com/blog/the-ember-run-loop-and-asynchronous-testing/
        runNextAsyncTask();

        // Fast-forward to expiration
        clock.next();

        // Second session requested
        assert.equal(ajaxMock.requests.length, 2);

        clock.restore();
    });
});
