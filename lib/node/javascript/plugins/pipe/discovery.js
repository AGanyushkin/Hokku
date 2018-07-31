// @flow
import type {
    HokkuType
} from '../../../../core/javascript/types/interface';
import type {
    ApplicationIdType,
    ServiceIdType,
    InstanceIdType,
    RinfoType
} from '../../../../core/javascript/types/core';
import dgram from 'dgram';
import os from 'os';
import {Netmask} from 'netmask';
import Rx from 'rxjs/Rx';

const HOKKU_DISCOVERY_MESSAGE_PREFIX = 'HOKKU_DISCOVERY';
const HOKKU_DISCOVERY_PICKUP_ME = 'PICKUP_ME';

type CfgType = {
    IP_VERSION: number,
    DISCOVERY_BEACON_PORT: number,
    PIPE_PORT: number
};

function getDescoveryCfg(hokku: HokkuType, type: string): CfgType {
    return {
        IP_VERSION: hokku.opts.pipe[type].ipVersion,
        DISCOVERY_BEACON_PORT: hokku.opts.pipe[type].port,
        PIPE_PORT: hokku.opts.pipe.port
    }
}

function discoveryRequestPickupMe(
    appId: ApplicationIdType,
    serviceId: ServiceIdType,
    instanceId: InstanceIdType,
    pipePort: number
) {
    const cmd = `${HOKKU_DISCOVERY_MESSAGE_PREFIX}:${HOKKU_DISCOVERY_PICKUP_ME}`;

    return `${cmd}:${appId}:${serviceId}:${instanceId}:${pipePort}`;
}

function isDiscoveryRequest(msg: string): boolean {
    const token = `${msg}`.split(':');

    return token[0] === HOKKU_DISCOVERY_MESSAGE_PREFIX;
}

function isDiscoveryRequestPickupMe(msg: string): boolean {
    const token = `${msg}`.split(':');

    return token[1] === HOKKU_DISCOVERY_PICKUP_ME;
}

function getDiscoveryRequestAppId(msg: string): string {
    const token = `${msg}`.split(':');

    // todo check value
    return token[2];
}

function getDiscoveryRequestServiceId(msg: string): string {
    const token = `${msg}`.split(':');

    // todo check value
    return token[3];
}

function getDiscoveryRequestInstanceId(msg: string): string {
    const token = `${msg}`.split(':');

    // todo check value
    return token[4];
}

function getDiscoveryRequestPipePort(msg: string): number {
    const token = `${msg}`.split(':');

    // todo check value
    return +token[5];
}

function handleIncomingDiscoveryEventFactory(discoverySubject: Rx.Subject) {
    return function handleIncomingDiscoveryEvent(msg: string, rInfo: RinfoType) {
        try {
            if (!isDiscoveryRequest(msg)) {
                throw new Error(`Incorrect discovery token format: ${msg}`);
            }
            if (isDiscoveryRequestPickupMe(msg)) {
                discoverySubject.next({
                    applicationid: getDiscoveryRequestAppId(msg),
                    serviceid: getDiscoveryRequestServiceId(msg),
                    instanceid: getDiscoveryRequestInstanceId(msg),
                    pipeAddress: rInfo.address,
                    pipePort: getDiscoveryRequestPipePort(msg)
                })
            } else {
                throw new Error(`Incorrect discovery token format: ${msg}`)
            }
        } catch (err) {
            console.log(err)
        }
    }
}

function getBroadcastAddress(cfg: CfgType) {
    const result = [];
    const ifaces = os.networkInterfaces();

    for (let iFaceType in ifaces) {
        if (!ifaces.hasOwnProperty(iFaceType)) continue;

        for (let i in ifaces[iFaceType]) {
            if (!ifaces[iFaceType].hasOwnProperty(i)) continue;

            const iface = ifaces[iFaceType][i];

            if (iface.family === `IPv${cfg.IP_VERSION}`) {
                result.push(
                    new Netmask(iface.address, iface.netmask)
                )
            }
        }
    }

    return result
}

function sendMessageToIP(address: string, message: string, cfg: CfgType) {
    const data = Buffer.from(message);
    const client = dgram.createSocket(`udp${cfg.IP_VERSION}`);

    client.bind(function () {
        client.setBroadcast(true);
    });
    client.send(data, cfg.DISCOVERY_BEACON_PORT, address, (err: Error): void => {
        if (err) {
            console.log(`ERROR: ${err.message}`)
        }
        client.close()
    })
}

function sendBroadcastMessage(message: string, cfg: CfgType): void {
    const list = getBroadcastAddress(cfg);

    for (let i in list) {
        if (!list.hasOwnProperty(i)) continue;
        sendMessageToIP(list[i].broadcast, message, cfg)
    }
}

export function discoveryEndpoint(hokku: HokkuType, discoverySubject: Rx.Subject): Promise<Rx.Subject> {
    const cfg = getDescoveryCfg(hokku, 'discovery');

    return new Promise((res: (discoverySubject: Rx.Subject) => void, rej: (err: string) => void) => {
        const server = dgram.createSocket(`udp${cfg.IP_VERSION}`);

        server.on('error', (err: Error): void => {
            server.close();
            rej(err)
        });
        server.on('message', handleIncomingDiscoveryEventFactory(discoverySubject));
        server.on('listening', () => {
            // server.address()
            res(discoverySubject);
        });

        server.bind(cfg.DISCOVERY_BEACON_PORT)
    })
}

export function discoveryBeacon(hokku: HokkuType) {
    const cfg = getDescoveryCfg(hokku, 'discoveryBeacon');
    const discoveryMessage = discoveryRequestPickupMe(
        hokku.opts.app,
        hokku.opts.service,
        hokku.data.instanceId,
        cfg.PIPE_PORT
    );

    sendBroadcastMessage(discoveryMessage, cfg);
}
