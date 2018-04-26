// @flow
import type {
    HokkuType,
    PluginObjectType,
    ActionType
} from '../../../../core/javascript/types/interface';
import type {
    DiscoveryEventType,
    ConnectionType
} from '../../../../core/javascript/types/core';
import Rx from 'rxjs/Rx';
import {discoveryEndpoint, discoveryBeacon} from './discovery';
import {pipeSocket, connectionToPipe} from './pipeSocket';
import {ActionTransport, Connection} from './util';
import {initStepEntine, incomingConnectionHandlerFactory} from './stepEngine';

function connectToBeacon(hokku: HokkuType, conn: ConnectionType): Promise<*> {
    return connectionToPipe(conn)
        .then((): void => {
            hokku.data.pipe.stepEngineRunner.next(conn);
        })
        .catch((err: Error) => {
            console.log(`startNewConnection fails with "${err.message}"`);
        })
}

function initDiscoveryHandler(hokku: HokkuType) {
    hokku.data.pipe.discoverySubject
        .filter((e: DiscoveryEventType) => e.instanceid !== hokku.data.instanceId)
        .filter((e: DiscoveryEventType) => e.applicationid === hokku.opts.app)
        .subscribe((e: DiscoveryEventType) => {
            const conn = new Connection(
                hokku,
                null,
                e.applicationid,
                e.serviceid,
                e.instanceid,
                e.pipeAddress,
                e.pipePort,
                true
            );
            const pool = hokku.data.pipe.connections;

            if (pool.hasOwnProperty(conn.instanceid)) {
                // todo, check if address already in the list
                pool[conn.instanceid].alternativeAddressList.push(
                    {address: conn.address, port: conn.port}
                )
            } else {
                pool[conn.instanceid] = conn;
                connectToBeacon(hokku, conn);
            }
        })
}

function connectToPipeDirectly(hokku: HokkuType, host: string, port: number) {
    const conn = new Connection(
        hokku,
        null,
        null,
        null,
        null,
        host,
        port,
        true
    );

    hokku.data.pipe.connSump.add(conn);

    connectToBeacon(hokku, conn);
}

function pluginInitializationChain(hokku: HokkuType): Promise<*> {
    return initStepEntine(hokku)
        .then(() => pipeSocket(hokku))
        .then(incomingConnectionHandlerFactory(hokku))
        .then((): Promise<*> => {
            if (hokku.opts.pipe.discovery) {
                return discoveryEndpoint(hokku, hokku.data.pipe.discoverySubject)
            }
            return Promise.resolve();
        })
        .then(() => {
            if (hokku.opts.pipe.discoveryBeacon) {
                discoveryBeacon(hokku);
            }
        })
        .then(() => {
            if (hokku.opts.pipe.connectTo) {
                connectToPipeDirectly(
                    hokku,
                    hokku.opts.pipe.connectTo.host,
                    hokku.opts.pipe.connectTo.port
                );
            }
        })
}

export default function PipePlugin(hokku: HokkuType): Promise<PluginObjectType> {
    if (hokku.opts.pipe) {
        hokku.data.pipe = hokku.data.pipe || {};
        hokku.data.pipe.connections = hokku.data.pipe.connections || {};
        hokku.data.pipe.connSump = hokku.data.pipe.connSump || new Set();
        hokku.data.pipe.stepEngineRunner = hokku.data.pipe.stepEngineRunner || new Rx.Subject();
        hokku.data.pipe.discoverySubject = hokku.data.pipe.discoverySubject || new Rx.Subject();

        initDiscoveryHandler(hokku);

        const plugin = {
            hook(action: ActionType): Promise<ActionType> {
                const pool = hokku.data.pipe.connections;

                for (let instId in pool) {
                    if (pool.hasOwnProperty(instId)) {
                        const conn = pool[instId];

                        if (conn.state === 'LIVE') {
                            conn.output.next(new ActionTransport(action, hokku));
                        }
                    }
                }
                return Promise.resolve(action);
            }
        };

        return pluginInitializationChain(hokku)
            .then(() => plugin)

    }
    return Promise.resolve(null);
}
