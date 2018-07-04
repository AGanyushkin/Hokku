// @flow
import type {
    ActionSwitcherDescriptionType,
    ReducerType,
    PayloadType,
    StateType
} from './types/interface';
import * as u from './util';

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

export const switcher = HokkuActionSwitcher;
