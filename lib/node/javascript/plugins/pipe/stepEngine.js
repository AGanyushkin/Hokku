// @flow
import type {
    ConnectionType
} from '../../../../core/javascript/types/core';
import type {
    CallbackType,
    ErrorCallbackType,
    HokkuType,
    PipeProtocolActionType
} from '../../../../core/javascript/types/interface';
import Rx from 'rxjs/Rx';
import {
    PipeActionClusterInfo,
    PipeActionGetClusterInfo,
    PipeActionLive,
    PipeActionSelfInfo,
    printConnectionPool
} from './util';
import {
    ACTION_TRANSPORTER,
    ACTION_SELF_INFO,
    ACTION_LIVE,
    ACTION_CLUSTER_INFO,
    ACTION_GET_CLUSTER_INFO
} from './pipeActions';

function doActionSelfInfo(hokku: HokkuType, conn: ConnectionType, action: PipeProtocolActionType): void {
    if (conn.state === 'JUST_CONNECTED') {

        // todo, check if equal if exists, actual then comes from discoveryEndpoint
        conn.applicationid = action.payload.applicationid;
        conn.serviceid = action.payload.serviceid;
        conn.instanceid = action.payload.instanceid;
        conn.port = action.payload.pipePort;

        conn.state = 'INITIALIZED';

        if (!hokku.data.pipe.connections.hasOwnProperty(conn.instanceid)) {
            hokku.data.pipe.connections[conn.instanceid] = conn;
            printConnectionPool(hokku);
        } else {
            const exConn = hokku.data.pipe.connections[conn.instanceid];

            if (exConn.owner && !conn.owner) {
                exConn.socketOutput = conn.socket;
                // todo, clear resources associated with conn
            }
        }

        if (hokku.data.pipe.connSump.has(conn)) {
            hokku.data.pipe.connSump.delete(conn);
        }
    }
}

function doActionTransporter(hokku: HokkuType, conn: ConnectionType, action: PipeProtocolActionType): void {
    if (conn.state !== 'LIVE') {
        throw new Error(`ACTION_TRANSPORTER from connection in state=${conn.state}, ${conn.instanceid}`);
    }
    hokku.fireOnlyForCore(action.payload);
}

function doActionLive(hokku: HokkuType, conn: ConnectionType, action: PipeProtocolActionType): void {
    // console.log(`doActionLive ${hokku.opts.service} <-> ${conn.serviceid}`);
    if (conn.state === 'INITIALIZED') {
        conn.state = 'LIVE';
    } else {
        // const info = `${hokku.data.instanceId}, ${conn.instanceid}, ${conn.state}`;
        // console.log(`connection not in INITIALIZED state: ${info}`);
    }
}

function doActionClusterInfo(hokku: HokkuType, conn: ConnectionType, action: PipeProtocolActionType): void {
    for (let instId of Object.keys(action.payload)) {
        const connection = action.payload[instId];

        if (instId !== hokku.data.instanceId && instId !== conn.instanceid) {
            hokku.data.pipe.discoverySubject.next({
                applicationid: connection.applicationid,
                serviceid: connection.serviceid,
                instanceid: connection.instanceid,
                pipeAddress: connection.address,
                pipePort: connection.port
            });

            // for (let addr of connection.alternativeAddressList) {
            //     discoverySubject.next({
            //         applicationid: connection.applicationid,
            //         serviceid: connection.serviceid,
            //         instanceid: connection.instanceid,
            //         pipeAddress: addr.address,
            //         pipePort: addr.port
            //     })
            // }
        }
    }
}

function doActionGetClusterInfo(hokku: HokkuType, conn: ConnectionType, action: PipeProtocolActionType): void {
    if (conn.state !== 'LIVE') {
        throw new Error(`ACTION_GET_CLUSTER_INFO from connection in state=${conn.state}, ${conn.instanceid}`);
    }

    const info = {};

    for (let instId of Object.keys(hokku.data.pipe.connections)) {
        const connection = hokku.data.pipe.connections[instId];

        if (connection.state === 'LIVE' && connection.instanceid !== conn.instanceid) {
            info[connection.instanceid] = {
                applicationid: connection.applicationid,
                serviceid: connection.serviceid,
                instanceid: connection.instanceid,
                state: connection.state,
                type: connection.type,
                address: connection.address,
                port: connection.port,
                alternativeAddressList: connection.alternativeAddressList
            }
        }
    }

    conn.output.next(new PipeActionClusterInfo(info));
}

function handlePipeActionFactory(hokku: HokkuType, conn: ConnectionType) {
    return function handlePipeAction(action: PipeProtocolActionType) {
        switch (action.type) {
            case ACTION_SELF_INFO: doActionSelfInfo(hokku, conn, action); break;
            case ACTION_TRANSPORTER: doActionTransporter(hokku, conn, action); break;
            case ACTION_LIVE: doActionLive(hokku, conn, action); break;
            case ACTION_CLUSTER_INFO: doActionClusterInfo(hokku, conn, action); break;
            case ACTION_GET_CLUSTER_INFO: doActionGetClusterInfo(hokku, conn, action); break;
            default:
                console.log(`Unsupported pipe protocol action ${JSON.stringify(action.type)}`);
        }
    }
}

export function handleConnectionInput(hokku: HokkuType, conn: ConnectionType): void {
    conn.input
        .subscribe(handlePipeActionFactory(hokku, conn))
}

function checkConnectionPool(hokku: HokkuType): void {
    for (let instId of Object.keys(hokku.data.pipe.connections)) {
        const conn = hokku.data.pipe.connections[instId];

        if (conn.state === 'INITIALIZED' && (!conn.owner || conn.socketOutput)) {
            conn.state = 'LIVE';
            conn.output.next(new PipeActionLive());

            // console.log(`LIVE ACTION ${hokku.data.instanceId} -> ${conn.instanceid}`);
        }
    }
}

function clusterInfoRequest(hokku: HokkuType) {
    for (let instId of Object.keys(hokku.data.pipe.connections)) {
        const conn = hokku.data.pipe.connections[instId];

        if (conn.state === 'LIVE') {
            conn.output.next(new PipeActionGetClusterInfo())
        }
    }
}

function watcherWrapper(handler: (hokku: HokkuType) => void, hokku: HokkuType) {
    return function watcherWrapperHandler(): void {
        handler(hokku);
    }
}

function stepRunnerHandlerFactory(hokku: HokkuType) {
    return function stepRunnerHandler(conn: ConnectionType) {
        conn.output.next(new PipeActionSelfInfo(hokku, conn));

        printConnectionPool(hokku);
    }
}

export function initStepEntine(hokku: HokkuType): Promise<*> {
    return new Promise((res: CallbackType, rej: ErrorCallbackType) => {

        Rx.Observable.interval(500)
            .subscribe(watcherWrapper(checkConnectionPool, hokku));

        Rx.Observable.interval(1000)
            .subscribe(watcherWrapper(clusterInfoRequest, hokku));

        hokku.data.pipe.stepEngineRunner
            .subscribe(stepRunnerHandlerFactory(hokku));

        res();
    })
}

export function incomingConnectionHandlerFactory(hokku: HokkuType) {
    return function incomingConnectionHandler(connectionSubject: Rx.Subject<ConnectionType>) {
        connectionSubject
            .subscribe((conn: ConnectionType) => {
                hokku.data.pipe.connSump.add(conn);
                conn.output.next(new PipeActionSelfInfo(hokku, conn));
            });
    }
}
