// @flow
import type {WaiterType} from './types/core'
import type {PayloadType} from './types/interface';

/**
 * const initializationWaiter = new Waiter();
 * initializationWaiter.resolve()
 * if (initializationWaiter.ready) { ... }
 *
 * @returns waiter: WaiterType
 * @constructor
 */
export default function Waiter(): WaiterType {
    let promiseRes = () => {};
    let promiseRej = () => {};
    let waiter: WaiterType = new Promise(function WaiterPromiseResolver(res: () => void, rej: () => void) {
        promiseRes = res;
        promiseRej = rej;
    });

    waiter.ready = false;
    waiter.error = false;
    waiter.done = false;

    waiter.resolve = function WaiterPromiseResolve(val: PayloadType) {
        waiter.ready = true;
        waiter.done = true;
        promiseRes(val);
    };
    waiter.reject = function WaiterPromiseReject(err: PayloadType) {
        waiter.error = true;
        waiter.done = true;
        promiseRej(err);
    };

    waiter.catch((er: Error): void => undefined);

    return waiter;
}
