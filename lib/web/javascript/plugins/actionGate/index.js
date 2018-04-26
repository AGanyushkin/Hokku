// @flow
import type {
    HokkuType,
    PluginObjectType,
    ActionType
} from '../../../../core/javascript/types/interface';
import {connectionToSocket} from './socket';
import {ActionGateTransport} from '../../../../node/javascript/plugins/actionGate/actions';
import {initStepEntine} from './stepEngine';
import type {ActionGateConnectionType} from '../../../../core/javascript/types/core';

function handleActionInPlugin(hokku: HokkuType, action: ActionType) {
    const conn = hokku.data.actionGate.connection;
    const prefix = hokku.opts.actionGate.prefix;

    if (!prefix || action.type.indexOf(prefix) === 0) {
        if (conn && conn.state === 'LIVE') {
            conn.output.next(new ActionGateTransport(action, hokku));
        }
    }
}

function pluginInitializationChain(hokku: HokkuType): Promise<*> {
    return initStepEntine(hokku)
        .then(() => connectionToSocket(hokku))
        .then((conn: ActionGateConnectionType): void => {
            hokku.data.actionGate.connection = conn;
        })
}

export default function ActionGatePlugin(hokku: HokkuType): Promise<PluginObjectType> {
    if (hokku.opts.actionGate) {
        hokku.data.actionGate = hokku.data.actionGate || {};
        hokku.data.actionGate.connection = hokku.data.actionGate.connection || null;

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
