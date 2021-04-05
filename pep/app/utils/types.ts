import Controller from '@ember/controller';

export type ConcreteSubclass<T> = new (...args: any[]) => T;
export type ControllerInstance = ConcreteSubclass<Controller>;

/**
 * Generic type guard
 *
 * @template T
 * @param {*} itemToCheck
 * @param {(Array<keyof T> | keyof T)} propertyNames
 * @returns {itemToCheck is T}
 */
export const guard = <T>(itemToCheck: any, propertyNames: Array<keyof T> | keyof T): itemToCheck is T => {
    return Array.isArray(propertyNames)
        ? Object.keys(itemToCheck as T).some((key) => propertyNames.indexOf(key as keyof T) >= 0)
        : (itemToCheck as T)[propertyNames as keyof T] !== undefined;
};

export const isArrayOf = <T>(itemToCheck: any[], propertyNames: Array<keyof T> | keyof T): itemToCheck is T[] => {
    return itemToCheck.any((item) => guard<T>(item, propertyNames));
};

/**
 * Pluck - allows you to pick one / multiple properties from one object
 *
 * @template T
 * @template K
 * @param {T} o
 * @param {(K[] | K)} propertyNames
 * @returns {(T[K][] | T[K])}
 */
export const pluck = <T, K extends keyof T>(o: T, propertyNames: K[] | K): T[K][] | T[K] => {
    return Array.isArray(propertyNames) ? propertyNames.map((n) => o[n]) : o[propertyNames];
};

/**
 * Flatten enum to get array of enum values
 *
 * @template T
 * @param {T} e
 * @return {*}  {T[]}
 */
export const flattenEnum = <T>(e: any): T[] => {
    return Object.values(e).filter((value) => typeof value === 'string') as T[];
};

/**
 * Workaround for https://discord.com/channels/480462759797063690/484421406659182603/827512106696966154
 *
 * @template T
 */
export type GlintTemporaryTypeFix<T> = { [K in keyof T]: T[K] };

export interface BaseGlimmerSignature<T> {
    Element: HTMLElement;
    Args: GlintTemporaryTypeFix<T>;
    Yields: {
        default?: [];
    };
}
