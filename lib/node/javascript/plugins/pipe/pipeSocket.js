// @flow
import type {
    PipeProtocolActionType,
    HokkuType, CallbackType, ErrorCallbackType, WebSocketType
} from '../../../../core/javascript/types/interface';
import type {
    ConnectionType,
    SocketIoConnectionType
} from '../../../../core/javascript/types/core';
import http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import Rx from 'rxjs/Rx';
import {Connection} from './util';
import {
    ACTION_GET_CLUSTER_INFO,
    ACTION_CLUSTER_INFO,
    ACTION_LIVE,
    ACTION_TRANSPORTER,
    ACTION_SELF_INFO
} from './pipeActions';

function pipeInputHandlerFactory(connection: ConnectionType) {
    return function pipeInputHandler(packet: Array<*>, next: () => void): void {
        const action = {type: packet[0], payload: packet[1]};

        connection.input.next(action);
        next()
    }
}

function preprocessIP(ip: string): string {
    const ipV4Prefix = '::ffff:';

    if (ip.indexOf(ipV4Prefix) === 0) {
        return ip.substr(ipV4Prefix.length);
    }

    return ip;
}

function pipeNewConnectionHandlerFactory(
    hokku: HokkuType,
    internalPool: WeakSet<ConnectionType>,
    socketSubject: Rx.Subject<ConnectionType>
) {
    return function pipeNewConnectionHandler(socket: SocketIoConnectionType) {
        const connection = new Connection(
            hokku,
            socket,
            null,
            null,
            null,
            preprocessIP(socket.request.connection.remoteAddress),
            null,
            false
        );

        // console.log(`new SocketIO connection ${socket.id}`);
        internalPool.add(connection);

        socket.use(pipeInputHandlerFactory(connection));

        connection.output.subscribe((action: PipeProtocolActionType) => {
            (connection.socketOutput || connection.socket).emit(action.type, action.payload);
        });

        socketSubject.next(connection);
    }
}

export function pipeSocket(hokku: HokkuType): Promise<Rx.Subject<ConnectionType>> {
    return new Promise((res: (socketSubject: Rx.Subject) => void, rej: (err: string) => void) => {
        const socketSubject = new Rx.Subject();
        const server = http.createServer();
        const io = SocketIO(server, hokku.opts.pipe.socketServer.cfg);

        // console.log(`Starting SocketServer on ${hokku.opts.pipe.port}`);
        server.listen(hokku.opts.pipe.port);

        const internalPool = new WeakSet();

        io.on('connection', pipeNewConnectionHandlerFactory(hokku, internalPool, socketSubject));

        res(socketSubject);
    })
}

function initActionHandlersForConnectionToPipe(socket: WebSocketType, conn: ConnectionType): void {
    const events = [
        ACTION_LIVE,
        ACTION_SELF_INFO,
        ACTION_TRANSPORTER,
        ACTION_CLUSTER_INFO,
        ACTION_GET_CLUSTER_INFO
    ];

    for (let type of events) {
        socket.on(type, (payload: string): void => {
            const action = {type, payload};

            conn.input.next(action);
        });
    }
}

export function connectionToPipe(conn: ConnectionType) {
    // console.log(`try to connect to ${conn.serviceid}, ${JSON.stringify(conn.alternativeAddressList)}`);
    return new Promise((res: CallbackType, rej: ErrorCallbackType) => {
        const address = conn.alternativeAddressList[0];
        const url = `http://${address.address}:${address.port}`;

        conn.address = address.address;
        conn.port = address.port;

        const socket = SocketIOClient(url);

        socket.on('connect', (): void => {
            conn.socket = socket;
            conn.output
                .subscribe((action: PipeProtocolActionType) => {
                    (conn.socketOutput || conn.socket).emit(action.type, action.payload);
                });
            res();
        });

        initActionHandlersForConnectionToPipe(socket, conn); // todo, it is worst implementation

        socket.on('disconnect', (): void => {
        });
    })
}
