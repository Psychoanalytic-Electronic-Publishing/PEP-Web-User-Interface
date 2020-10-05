declare module 'ember-cookies/services/cookies' {
    export interface CookieReadOptions {
        raw?: boolean;
    }

    export interface CookieWriteOptions extends CookieReadOptions {
        domain?: string;
        expires?: Date;
        maxAge?: number;
        path?: string;
        sameSite?: string;
        secure?: boolean;
    }

    export default class CookiesService {
        read(name: string, options?: CookieReadOptions): string;
        write(name: string, value: string, options: CookieWriteOptions): void;
        clear(name: string, options: CookieWriteOptions): void;
        exists(name: string): boolean;
    }
}
