// @flow
import type {
    ActionGateProtocolActionType,
    HokkuType
} from '../../../../core/javascript/types/interface';
import type {
    ConnectionType,
    SocketIoConnectionType
} from '../../../../core/javascript/types/core';
import http from 'http';
import SocketIO from 'socket.io';
import Rx from 'rxjs/Rx';
import {ActionGateConnection} from './util';

function pipeInputHandlerFactory(connection: ConnectionType) {
    return function pipeInputHandler(packet: Array<*>, next: () => void): void {
        const action = {type: packet[0], payload: packet[1]};

        connection.input.next(action);
        next()
    }
}

function actionGateNewConnectionHandlerFactory(
    hokku: HokkuType,
    internalPool: WeakSet<ConnectionType>,
    socketSubject: Rx.Subject<ConnectionType>
) {
    return function actionGateNewConnectionHandler(socket: SocketIoConnectionType) {
        const conn = new ActionGateConnection(
            hokku,
            socket
        );

        // console.log(`new SocketIO connection ${socket.id}`);
        internalPool.add(conn);

        socket.use(pipeInputHandlerFactory(conn));

        conn.output.subscribe((action: ActionGateProtocolActionType) => {
            conn.socket.emit(action.type, action.payload);
        });

        socketSubject.next(conn);
    }
}

export function actionGateSocket(hokku: HokkuType): Promise<Rx.Subject<ConnectionType>> {
    return new Promise((res: (socketSubject: Rx.Subject) => void, rej: (err: string) => void) => {
        const socketSubject = new Rx.Subject();
        const server = http.createServer();
        const io = SocketIO(server, hokku.opts.actionGate.socketServer.cfg);

        // console.log(`Starting SocketServer on ${hokku.opts.actionGate.port}`);
        server.listen(hokku.opts.actionGate.port);

        const internalPool = new WeakSet();

        io.on('connection', actionGateNewConnectionHandlerFactory(hokku, internalPool, socketSubject));

        res(socketSubject);
    })
}
