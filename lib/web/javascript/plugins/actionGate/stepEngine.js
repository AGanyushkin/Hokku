// @flow
import type {
    ActionGateConnectionType
} from '../../../../core/javascript/types/core';
import type {
    ActionGateProtocolActionType,
    CallbackType,
    ErrorCallbackType,
    HokkuType
} from '../../../../core/javascript/types/interface';
import {
    ACTION_GATE_TRANSPORT,
    ACTION_GATE_PUT_TO_SESSION_STATE,
    ACTION_GATE_GET_SESSION_STATE,
    ACTION_GATE_PUT_TO_STATE,
    ACTION_GATE_GET_STATE,
    ActionGateSessionState,
    ActionGateState
} from '../../../../node/javascript/plugins/actionGate/actions';

function do_ACTION_GATE_TRANSPORT(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    if (conn.state !== 'LIVE') {
        throw new Error(`ACTION_GATE_TRANSPORT from connection in state=${conn.state}, ${conn.id}`);
    }
    const {type, payload} = action.payload;
    const prefix = hokku.opts.actionGate.prefix;

    if (!prefix || type.indexOf(prefix) === 0) {
        hokku.fireOnlyForCore({type, payload});
    }
}

function do_ACTION_GATE_PUT_TO_SESSION_STATE(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    for (let key in action.payload) {
        sessionStorage.setItem(key, action.payload[key]);
    }
}

function do_ACTION_GATE_GET_SESSION_STATE(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    const state = {};

    for (let key in sessionStorage) {
        state[key] = sessionStorage.getItem(key);
    }

    conn.output.next(new ActionGateSessionState(state))
}

function do_ACTION_GATE_PUT_TO_STATE(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    for (let key in action.payload) {
        localStorage.setItem(key, action.payload[key]);
    }
}

function do_ACTION_GATE_GET_STATE(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    const state = {};

    // todo, need to pull values by key list received in request.
    // currently we are pulling all values from localStorage & sessionStorage.

    for (let key in localStorage) {
        state[key] = localStorage.getItem(key);
    }

    conn.output.next(new ActionGateState(state))
}

function handleActionFactory(hokku: HokkuType, conn: ActionGateConnectionType) {
    return function handleAction(action: ActionGateProtocolActionType) {
        switch (action.type) {
            case ACTION_GATE_TRANSPORT: do_ACTION_GATE_TRANSPORT(hokku, conn, action); break;
            case ACTION_GATE_PUT_TO_SESSION_STATE: do_ACTION_GATE_PUT_TO_SESSION_STATE(hokku, conn, action); break;
            case ACTION_GATE_GET_SESSION_STATE: do_ACTION_GATE_GET_SESSION_STATE(hokku, conn, action); break;
            case ACTION_GATE_PUT_TO_STATE: do_ACTION_GATE_PUT_TO_STATE(hokku, conn, action); break;
            case ACTION_GATE_GET_STATE: do_ACTION_GATE_GET_STATE(hokku, conn, action); break;
            default:
                console.log(`Unsupported actionGate protocol action ${JSON.stringify(action.type)}`);
        }
    }
}

export function handleConnectionInput(hokku: HokkuType, conn: ActionGateConnectionType): void {
    conn.input
        .subscribe(handleActionFactory(hokku, conn))
}

export function initStepEntine(hokku: HokkuType): Promise<*> {
    return new Promise((res: CallbackType, rej: ErrorCallbackType) => {

        res();
    })
}
