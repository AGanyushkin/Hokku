// @flow
import type {
    ActionGateConnectionType
} from '../../../../core/javascript/types/core';
import type {
    ActionGateProtocolActionType,
    CallbackType,
    ErrorCallbackType, HokkuType,
    WebSocketType
} from '../../../../core/javascript/types/interface';
import {
    ACTION_GATE_TRANSPORT,
    ACTION_GATE_PUT_TO_SESSION_STATE,
    ACTION_GATE_GET_SESSION_STATE,
    ACTION_GATE_PUT_TO_STATE,
    ACTION_GATE_GET_STATE
} from '../../../../node/javascript/plugins/actionGate/actions';
import SocketIOClient from 'socket.io-client';
import {
    ActionGateClientConnection
} from './util';

// todo, refactoring, same handlers in other modules are exists, check it.
function initActionHandlersForConnection(socket: WebSocketType, conn: ActionGateConnectionType): void {
    const events = [
        ACTION_GATE_TRANSPORT,
        ACTION_GATE_PUT_TO_SESSION_STATE,
        ACTION_GATE_GET_SESSION_STATE,
        ACTION_GATE_PUT_TO_STATE,
        ACTION_GATE_GET_STATE
    ];

    for (let type of events) {
        socket.on(type, (payload: string): void => {
            const action = {type, payload};

            conn.input.next(action);
        });
    }
}

export function connectionToSocket(hokku: HokkuType) {
    // console.log(`try to connect to ${conn.serviceid}, ${JSON.stringify(conn.alternativeAddressList)}`);
    return new Promise((res: CallbackType, rej: ErrorCallbackType) => {
        const address = hokku.opts.actionGate.host;
        const port = hokku.opts.actionGate.port;
        const url = `http://${address}:${port}`;

        const socket = SocketIOClient(url);

        socket.on('connect', (): void => {
            const conn = new ActionGateClientConnection(hokku, socket);

            conn.output
                .subscribe((action: ActionGateProtocolActionType) => {
                    conn.socket.emit(action.type, action.payload);
                });

            initActionHandlersForConnection(socket, conn); // todo, it is worst implementation

            res(conn);
        });

        socket.on('disconnect', (): void => {
        });
    })
}
