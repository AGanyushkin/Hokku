// @flow
import type {UnverifiedObjectType} from './types/interface';

export function getStringOrFalse(val: UnverifiedObjectType): string | boolean {
    return (typeof val === 'string') ? val : false
}

export function isNode(): boolean {
    return typeof global !== 'undefined' // todo, minification
}

export function isWeb(): boolean {
    return typeof window !== 'undefined' // todo, minification
}

export function getPlatformGlobalObject(): GlobalObjectType {
    const gObj = global || window;

    return gObj
}

export function isObject(val: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(val) === '[object Object]'
}

export function isNull(value: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(value) === '[object Null]';
}

export function isSameType(value1: UnverifiedObjectType, value2: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(value1) === Object.prototype.toString.call(value2);
}

export function isSelector(selector: UnverifiedObjectType): boolean {
    if (!selector) return false; // throw new Error('Selector is not defined')
    if (typeof selector !== 'function') return false; // throw new Error('Selector is not a function')
    if (selector.length !== 1) return false; // throw new Error('Selector must has only one argument (state)')
    return true
}

export function isSampleActionSet(obj: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isTrue(value: UnverifiedObjectType): boolean {
    if (typeof value !== 'boolean') return false; // throw new Error('Selector is not a function')
    if (!value) return false; // throw new Error('Selector must has only one argument (state)')
    return true
}

export function isString(value: UnverifiedObjectType): boolean {
    if (typeof value !== 'string') return false; // throw new Error('Selector is not a function')
    if (value.length === 0) return false; // throw new Error('Selector must has only one argument (state)')
    return true
}

export function isNumber(value: UnverifiedObjectType): boolean {
    if (typeof value !== 'number') return false; // throw new Error('Selector is not a function')
    if (isNaN(value)) return false;
    return true
}

export function isAction(obj: UnverifiedObjectType): boolean {
    return isObject(obj) && isString(obj.type)
}

export function isList(obj: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(obj) === '[object Array]'
}

export function isReducer(obj: UnverifiedObjectType): boolean {
    if (typeof obj !== 'function') return false;
    if (obj.length !== 3) return false;
    return true
}

export function isHookHandler(obj: UnverifiedObjectType): boolean {
    if (typeof obj !== 'function') return false;
    if (obj.length !== 1) return false;
    return true
}

export function isPromiseDirtyCheck(obj: UnverifiedObjectType): boolean {
    return (
        obj !== null &&
        obj !== undefined && (
            Object.prototype.toString.call(obj) === '[object Promise]' ||
            Object.prototype.toString.call(obj.then) === '[object Function]'
        )
    )
}

export function isFunction(obj: UnverifiedObjectType): boolean {
    return Object.prototype.toString.call(obj) === '[object Function]'
}
