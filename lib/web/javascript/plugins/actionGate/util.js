// @flow
import type {
    HokkuType,
    WebSocketType
} from '../../../../core/javascript/types/interface';
import type {
    ActionGateConnectionType
} from '../../../../core/javascript/types/core';
import uuid from 'uuid/v4';
import Rx from 'rxjs/Rx';
import {handleConnectionInput} from './stepEngine';

export function ActionGateClientConnection(hokku: HokkuType, socket: WebSocketType): ActionGateConnectionType {
    this.id = uuid();
    this.socket = socket;
    this.input = new Rx.Subject();
    this.output = new Rx.Subject();
    this.state = 'LIVE';

    handleConnectionInput(hokku, this);
}
