// @flow
import type {
    ActionType,
    ActionCreatorType,
    ActionSwitcherDescriptionType,
    ReducerType,
    PayloadType,
    StateType
} from './types/interface'
import type {PayloadBuildType} from './types/core'
import * as u from './util'
import uuid from 'uuid/v4'

function HokkuActionCreatorFactory(type: string = uuid(), payloadCB: ?PayloadBuildType): ActionCreatorType {
    // eslint-disable-next-line flowtype/no-weak-types
    const defPayloadBuilder = (payload: any): any => payload;
    const payloadTransformer: PayloadBuildType = payloadCB || defPayloadBuilder;

    if (!u.isString(type)) throw new Error(`Incorrect action definition with type "${type}":${typeof type}`);
    // eslint-disable-next-line flowtype/no-weak-types
    function _createAction(payload: any): ActionType {
        return {
            type,
            payload: payloadTransformer(payload ? payload : undefined)
        }
    }
    _createAction.toString = (): string => type;
    _createAction.is = (_type: string): boolean => type === `${_type}`;
    return _createAction
}

// eslint-disable-next-line flowtype/no-weak-types
function HokkuActionFactory(type: string, payload: any): ActionType {
    if (!u.isString(type)) throw new Error('Incorrect action type value');
    return {
        type,
        payload
    }
}

function HokkuActionSwitcher(descr: ActionSwitcherDescriptionType): ReducerType {
    // todo, handling for invalid descr value

    return function actionSwitcherHandler(type: string, payload: PayloadType, state: StateType): StateType {
        if (descr.hasOwnProperty(type)) {
            if (u.isFunction(descr[type])) {
                return descr[type](payload, state);
            }
        }
        return state;
    }
}

export const def = HokkuActionCreatorFactory;
export const action = HokkuActionFactory;
export const switcher = HokkuActionSwitcher;
