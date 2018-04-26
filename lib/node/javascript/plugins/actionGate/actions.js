// @flow
import type {
    ActionType, HokkuType
} from '../../../../core/javascript/types/interface';

export const ACTION_GATE_TRANSPORT = 'ACTION_GATE_TRANSPORT';
export const ACTION_GATE_PUT_TO_SESSION_STATE = 'ACTION_GATE_PUT_TO_SESSION_STATE';
export const ACTION_GATE_GET_SESSION_STATE = 'ACTION_GATE_GET_SESSION_STATE';
export const ACTION_GATE_SESSION_STATE = 'ACTION_GATE_SESSION_STATE';
export const ACTION_GATE_PUT_TO_STATE = 'ACTION_GATE_PUT_TO_STATE';
export const ACTION_GATE_GET_STATE = 'ACTION_GATE_GET_STATE';
export const ACTION_GATE_STATE = 'ACTION_GATE_STATE';

export function ActionGateTransport(action: ActionType, hokku: HokkuType) {
    return {
        type: ACTION_GATE_TRANSPORT,
        payload: action
    }
}

export function ActionGatePutToSessionState(payload: any) {
    return {
        type: ACTION_GATE_PUT_TO_SESSION_STATE,
        payload
    }
}

export function ActionGateGetSessionState() {
    return {
        type: ACTION_GATE_GET_SESSION_STATE,
        payload: null
    }
}

export function ActionGateSessionState(payload: any) {
    return {
        type: ACTION_GATE_SESSION_STATE,
        payload
    }
}

export function ActionGatePutToState(payload: any) {
    return {
        type: ACTION_GATE_PUT_TO_STATE,
        payload
    }
}

export function ActionGateGetState() {
    return {
        type: ACTION_GATE_GET_STATE,
        payload: undefined
    }
}

export function ActionGateState(payload: any) {
    return {
        type: ACTION_GATE_STATE,
        payload
    }
}
