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
    ACTION_GATE_SESSION_STATE,
    ACTION_GATE_STATE,
    ActionGateGetState,
    ActionGateGetSessionState
} from './actions';
import Rx from 'rxjs/Rx';
import {buildAction} from './util';

function doActionGateTransport(
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
        hokku.fireOnlyForCore(
            buildAction(conn.id, type, payload, hokku)
        );
    }
}

function doActionGateSessionState(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    hokku.data.actionGate.clientSessionStorage[conn.id] = action.payload;
}

function doActionGateState(
    hokku: HokkuType,
    conn: ActionGateConnectionType,
    action: ActionGateProtocolActionType
): void {
    hokku.data.actionGate.clientStorage[conn.id] = action.payload;
}

function handleActionFactory(hokku: HokkuType, conn: ActionGateConnectionType) {
    return function handleAction(action: ActionGateProtocolActionType) {
        switch (action.type) {
            case ACTION_GATE_TRANSPORT: doActionGateTransport(hokku, conn, action); break;
            case ACTION_GATE_SESSION_STATE: doActionGateSessionState(hokku, conn, action); break;
            case ACTION_GATE_STATE: doActionGateState(hokku, conn, action); break;
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

export function incomingConnectionHandlerFactory(hokku: HokkuType) {
    return function incomingConnectionHandler(connectionSubject: Rx.Subject<ActionGateConnectionType>) {
        connectionSubject
            .subscribe((conn: ActionGateConnectionType) => {
                if (hokku.opts.actionGate.syncClientStorage) {
                    conn.output.next(new ActionGateGetSessionState());
                    conn.output.next(new ActionGateGetState());
                }
                hokku.data.actionGate.connections[conn.id] = conn;
            });
    }
}
