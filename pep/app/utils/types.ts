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

// export class Result<T> {
//     public isSuccess: boolean;
//     public isFailure: boolean;
//     public error?: string;
//     private _value?: T;

//     private constructor(isSuccess: boolean, error?: string, value?: T) {
//         if (isSuccess && error) {
//             throw new Error(`InvalidOperation: A result cannot be
//           successful and contain an error`);
//         }
//         if (!isSuccess && !error) {
//             throw new Error(`InvalidOperation: A failing result
//           needs to contain an error message`);
//         }

//         this.isSuccess = isSuccess;
//         this.isFailure = !isSuccess;
//         this.error = error;
//         this._value = value;

//         Object.freeze(this);
//     }

//     public getValue(): T | undefined {
//         if (!this.isSuccess) {
//             throw new Error(`Cant retrieve the value from a failed result.`);
//         }

//         return this._value;
//     }

//     public static ok<U>(value?: U): Result<U> {
//         return new Result<U>(true, undefined, value);
//     }

//     public static fail<U>(error: string): Result<U> {
//         return new Result<U>(false, error);
//     }

//     public static combine(results: Result<any>[]): Result<any> {
//         for (let result of results) {
//             if (result.isFailure) return result;
//         }
//         return Result.ok<any>();
//     }
// }
