import { getOwner } from '@ember/application';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { EmberOwner } from 'global';

/**
 * Annotates a class method to not execute its containing implementation
 * when running in FastBoot. This is useful for omitting DOM-related logic
 * or skipping non-blocking API requests that are not used to render the
 * page on the server-side.
 * @param {any} _target
 * @param {string} _propertyKey
 * @param {any} descriptor
 */
export function dontRunInFastboot(_target: any, _propertyKey: string, descriptor?: any) {
    const fn = descriptor.value;
    descriptor.value = function(...args: any[]) {
        const owner = getOwner(this) as EmberOwner;
        const isFastboot = (owner.lookup(`service:fastboot`) as FastbootService)?.isFastBoot;
        if (!isFastboot) {
            fn.call(this, ...args);
        }
    };
}
