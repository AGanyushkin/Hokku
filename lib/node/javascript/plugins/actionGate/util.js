// @flow
import type {
    HokkuType,
    WebSocketType,
    PayloadType,
    ActionType
} from '../../../../core/javascript/types/interface';
import type {
    ActionGateConnectionType
} from '../../../../core/javascript/types/core';
import uuid from 'uuid/v4';
import Rx from 'rxjs/Rx';
import {handleConnectionInput} from './stepEngine';

export function ActionGateConnection(hokku: HokkuType, socket: WebSocketType): ActionGateConnectionType {
    this.id = uuid();
    this.socket = socket;
    this.input = new Rx.Subject();
    this.output = new Rx.Subject();
    this.state = 'LIVE';

    handleConnectionInput(hokku, this);
}

export function buildAction(key: string, type: string, payload: PayloadType, hokku: HokkuType): ActionType {
    const action = Object.create({
        responseAction(payload: PayloadType) {
            return {
                type: this.key,
                payload
            }
        },
        response(payload: PayloadType) {
            hokku.fire(this.responseAction(payload));
        }
    });

    action.type = type;
    action.payload = payload;
    action.key = key;

    if (hokku.opts.actionGate.syncClientStorage) {
        action.clientStorage = hokku.data.actionGate.clientStorage[key];
        action.clientSessionStorage = hokku.data.actionGate.clientSessionStorage[key];
    }
    return action;
}
