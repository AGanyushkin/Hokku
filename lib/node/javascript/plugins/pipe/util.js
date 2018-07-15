// @flow
import type {
    HokkuType,
    ActionType,
    WebSocketType,
    PipeProtocolActionType
} from '../../../../core/javascript/types/interface';
import type {
    ConnectionType
} from '../../../../core/javascript/types/core';
import {handleConnectionInput} from './stepEngine';
import {
    ACTION_TRANSPORTER,
    ACTION_SELF_INFO,
    ACTION_LIVE,
    ACTION_GET_CLUSTER_INFO,
    ACTION_CLUSTER_INFO
} from './pipeActions';
import Rx from 'rxjs/Rx';
import {PipeProtocolClusterInfoType} from '../../../../core/javascript/types/core';

export function PipeActionLive() {
    this.type = ACTION_LIVE;
    this.payload = null;
}

export function ActionTransport(action: ActionType, hokku: HokkuType): PipeProtocolActionType {
    this.type = ACTION_TRANSPORTER;
    this.payload = action;
    this.instanceid = hokku.data.instanceId;
}

export function Connection(
    hokku: HokkuType,
    ws: WebSocketType,
    applicationid: string,
    serviceid: string,
    instanceid: string,
    address: string,
    port: number,
    owner: boolean,
): ConnectionType {
    this.socket = ws;
    this.socketOutput = null;
    this.input = new Rx.Subject();
    this.output = new Rx.Subject();
    this.applicationid = applicationid;
    this.serviceid = serviceid;
    this.instanceid = instanceid;
    this.state = 'JUST_CONNECTED';
    this.type = 'NODE';
    this.address = !owner ? address : null;
    this.port = !owner ? port : null;
    this.alternativeAddressList = [{address, port}];
    this.owner = owner;

    handleConnectionInput(hokku, this);
}

export function PipeActionSelfInfo(hokku: HokkuType, conn: ConnectionType) {
    this.type = ACTION_SELF_INFO;
    this.payload = {
        applicationid: hokku.opts.app,
        serviceid: hokku.opts.service,
        instanceid: hokku.data.instanceId,
        pipePort: hokku.opts.pipe.port
    }
}

export function PipeActionGetClusterInfo(): PipeProtocolActionType {
    this.type = ACTION_GET_CLUSTER_INFO;
    this.payload = null;
}

export function PipeActionClusterInfo(clusterInfo: PipeProtocolClusterInfoType): PipeProtocolActionType {
    this.type = ACTION_CLUSTER_INFO;
    this.payload = clusterInfo;
}

export function printConnectionPool(hokku: HokkuType) {
    // const pool = hokku.data.pipe.connections;
    // const name = `instance=${hokku.data.instanceId}, app=${hokku.opts.app}, srv=${hokku.opts.service}`;
    //
    // console.log('----------------------------------------------------------');
    // console.log(`Pipe Connection Pool: size=${Object.keys(pool).length}, ${name}, `);
    //
    // for (let instId in pool) {
    //     const conn = pool[instId];
    //     const name = `instance=${conn.instanceid}, app=${conn.applicationid}, srv=${conn.serviceid}`;
    //     const address = `address=${conn.address}, port=${conn.port}, ${JSON.stringify(conn.alternativeAddressList)}`;
    //
    //     console.log(`- ${name}, state=${conn.state}, owner=${conn.owner}, ${address}`);
    // }
    //
    // console.log('----------------------------------------------------------');
}
