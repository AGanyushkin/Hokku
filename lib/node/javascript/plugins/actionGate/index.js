// @flow
import type {
    HokkuType,
    PluginObjectType,
    ActionType
} from '../../../../core/javascript/types/interface';
import type {ActionGateConnectionType} from '../../../../core/javascript/types/core';
import {actionGateSocket} from './socketServer';
import {initStepEntine, incomingConnectionHandlerFactory} from './stepEngine';
import {
    ActionGateTransport,
    ActionGatePutToState,
    ActionGatePutToSessionState
} from './actions';

function pluginInitializationChain(hokku: HokkuType): Promise<*> {
    return initStepEntine(hokku)
        .then(() => actionGateSocket(hokku))
        .then(incomingConnectionHandlerFactory(hokku))
}

function putNewFieldsToClientStorage(hokku: HokkuType, action: ActionType, conn: ActionGateConnectionType) {
    hokku.data.actionGate.clientStorage[conn.id] = Object.assign(
        hokku.data.actionGate.clientStorage[conn.id] || {},
        action.payload
    );
    conn.output.next(new ActionGatePutToState(action.payload));
}

function putNewFieldsToClientSessionStorage(hokku: HokkuType, action: ActionType, conn: ActionGateConnectionType) {
    hokku.data.actionGate.clientSessionStorage[conn.id] = Object.assign(
        hokku.data.actionGate.clientSessionStorage[conn.id] || {},
        action.payload
    );
    conn.output.next(new ActionGatePutToSessionState(action.payload));
}

function sendActionToConnectionIfActive(hokku: HokkuType, conn: ActionGateConnectionType, action: ActionType) {
    if (conn.state === 'LIVE') {

        if (hokku.opts.actionGate.putActions.indexOf(action.type) > -1) {
            putNewFieldsToClientStorage(hokku, action, conn);
        }
        if (hokku.opts.actionGate.putSessionActions.indexOf(action.type) > -1) {
            putNewFieldsToClientSessionStorage(hokku, action, conn);
        }

        conn.output.next(new ActionGateTransport(action, hokku));
    }
}

function handleActionInPlugin(hokku: HokkuType, action: ActionType) {
    const pool = hokku.data.actionGate.connections;
    const prefix = hokku.opts.actionGate.prefix;

    if (hokku.data.actionGate.connections.hasOwnProperty(action.type)) {
        const conn = hokku.data.actionGate.connections[action.type];

        sendActionToConnectionIfActive(hokku, conn, action.payload);
    } else if (!prefix || action.type.indexOf(prefix) === 0) {
        for (let id in pool) {
            if (pool.hasOwnProperty(id)) {
                const conn = pool[id];

                sendActionToConnectionIfActive(hokku, conn, action);
            }
        }
    }
}

export default function ActionGate(hokku: HokkuType): Promise<PluginObjectType> {
    if (hokku.opts.actionGate) {
        // todo, use Map instead of Object
        hokku.data.actionGate = hokku.data.actionGate || {};
        hokku.data.actionGate.connections = hokku.data.actionGate.connections || {};
        hokku.data.actionGate.clientStorage = hokku.data.actionGate.clientStorage || {};
        hokku.data.actionGate.clientSessionStorage = hokku.data.actionGate.clientSessionStorage || {};

        if (hokku.opts.actionGate.putActions) {
            hokku.opts.actionGate.putActions = hokku.opts.actionGate.putActions.map((act: any) => `${act}`);
        }
        if (hokku.opts.actionGate.putSessionActions) {
            hokku.opts.actionGate.putSessionActions =
                hokku.opts.actionGate.putSessionActions.map((act: any) => `${act}`);
        }

        const plugin = {
            hook(action: ActionType): Promise<ActionType> {
                handleActionInPlugin(hokku, action);
                return Promise.resolve(action);
            }
        };

        return pluginInitializationChain(hokku)
            .then(() => plugin)
    }
    return Promise.resolve(null);
}
