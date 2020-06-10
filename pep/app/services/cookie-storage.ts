import ApplicationInstance from '@ember/application/instance';

export default class CookieStorage {
    static owner: ApplicationInstance;

    /**
     * Looks up and returns the ember-cookies provided `cookies` service instance
     *
     * @readonly
     * @static
     * @memberof CookieStorage
     */
    static get cookies() {
        return this.owner.lookup('service:cookies');
    }

    /**
     * Sets an item in cookies
     *
     * @static
     * @param {string} key
     * @param {string} value
     * @returns string
     * @memberof CookieStorage
     */
    static setItem(key: string, value: string): string {
        this.cookies.write(key, value);
        return this.cookies.read(key);
    }

    /**
     * Gets an item from cookies
     *
     * @static
     * @param {string} key
     * @returns string
     * @memberof CookieStorage
     */
    static getItem(key: string): string {
        return this.cookies.read(key);
    }

    /**
     * Removes an item from cookies
     *
     * @static
     * @param {string} key
     * @returns void
     * @memberof CookieStorage
     */
    static removeItem(key: string): void {
        return this.cookies.clear(key);
    }

    /**
     * Clear all cognito-related cookies
     *
     * @static
     * @memberof CookieStorage
     * @returns void
     */
    static clear(): void {
        const cookieRegex = /^CognitoIdentityServiceProvider/;
        const cookies = this.cookies.read();
        if (cookies) {
            Object.keys(cookies).forEach((key) => {
                if (cookieRegex.test(key)) {
                    this.removeItem(key);
                }
            });
        }
    }
}
