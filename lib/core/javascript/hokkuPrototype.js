// @flow
import Rx from 'rxjs/Rx'
import {isReducer, isSelector, isHookHandler, isList, isAction, isSampleActionSet, isFunction} from './util'
import {applyReducer, applySamples, applyPlugins, fireActionToActPoolMap} from './core'
import * as kStatic from './hokkuStatic'

import type {
    ReducerType,
    StateSelectorType,
    StateType,
    RxStreamType,
    HookCallbackType,
    HookType,
    ActionType,
    ActionCreatorType,
    SampleActionSetType,
    PayloadType,
    HokkuType,
    LibraryEntityType,
    StateWatcherHandlerType
} from './types/interface';
import type {
    StorageDriverType,
    StorageEntityOptionsType,
    StorageSearchQueryType
} from './types/core';

const HokkuPrototype = {
    setState(state: StateType): void {
        if (state === undefined) throw new Error('State must not be undefined!');
        this.data.state = state
    },

    setReducer(reducer: ReducerType): void {
        if (!isReducer(reducer)) {
            throw new Error('Reducer must ba a reducer!');
        }
        this.data.reducer = reducer
    },

    select(selector: StateSelectorType): StateType {
        // todo,  return copy ?
        // todo, if selector is map then build "mapSelector": {v1 : state => state.v1}

        if (isSelector(selector)) {
            return selector(this.data.state)
        } else if (selector === undefined) {
            return this.data.state
        }
        throw new Error('Incorrect store selector')
    },

    // todo, need to have method to unsubscribe for it, or not?
    hookAll(): RxStreamType {
        return this.data.baseWatcher = this.data.baseWatcher || new Rx.Subject()
    },

    // todo, need to have method to unsubscribe, or not?
    hook(actionTypeOrTypes: HookType, handler: HookCallbackType): RxStreamType {

        function bindAtListener(hokku: HokkuType, type: string): RxStreamType {
            hokku.data.actPoolMap[type] = hokku.data.actPoolMap[type] || new Rx.Subject();

            const subject = hokku.data.actPoolMap[type]
                .do((action: ActionType): void => {
                    hokku.opts.debug && console.log(`Hokku.prototype.act: ${JSON.stringify(action)}`)
                });

            if (isHookHandler(handler)) {
                subject.subscribe(
                    (act: ActionType): void => {
                        try {
                            handler(act)
                        } catch (e) {
                            // todo, need to handle it
                        }
                    }
                )
            }
            return subject
        }

        if (isList(actionTypeOrTypes)) {
            // todo, error handling?
            return Rx.Observable.merge(
                ...actionTypeOrTypes.map(
                    (type: string): void => bindAtListener(this, `${type}`)
                )
            )
        }

        return bindAtListener(this, `${actionTypeOrTypes}`)
    },

    /**
     * actions from user code and actions from socket
     *
     * @param action
     * @returns {Promise.<T>}
     */
    fire(action: ActionType): Promise<ActionType> {
        return this.fireOnlyForCore(action)
            .then((action: ActionType) => {
                applyPlugins(this, action);
                return action;
            })
    },

    fireOnlyForCore(action: ActionType): Promise<ActionType> {
        return this.data.init
            .then(() => {
                if (!isAction(action)) {
                    const appName = `${this.opts.app}_${this.opts.service}`;

                    throw new Error(`${appName} fire exception, action is not an action, ${action}`)
                }
                this.opts.debug && console.log(`Hokku.prototype.fire: ${JSON.stringify(action)}`);

                applyReducer(this.data, action);

                if (this.data.baseWatcher) {
                    this.data.baseWatcher.next(action)
                }
                fireActionToActPoolMap(this, action);

                applySamples(this, action)
            })
            .then(() => action)
    },

    // todo, interesting, one more implementation for this function to wrap Hokku.def actions.
    def(type: string, defPayload: PayloadType): ActionCreatorType {
        const _doSomething = kStatic.def(type);

        const _fireActionDef = (payload: PayloadType): void => {
            this.fire(
                // todo, split static methods from Hokku container to be able to use here
                _doSomething(payload || defPayload)
            )
        };

        _fireActionDef.toString = _doSomething.toString;
        _fireActionDef.is = _doSomething.is;
        return _fireActionDef
    },

    samples(mapping: SampleActionSetType): void {
        if (isSampleActionSet(mapping) || (mapping === null)) {
            this.data.sampleMapping = mapping
        } else {
            throw new Error('Incorrect sample set map')
        }
    },

    lib(libraryName: string): LibraryEntityType {
        if (this.data.lib.hasOwnProperty(libraryName)) {
            return this.data.lib[libraryName];
        }
        throw new Error(`Undefined library name "${libraryName}"`)
    },

    stateWatcher(handler: StateWatcherHandlerType) {
        if (isFunction(handler)) {
            this.data.stateWatcher
                .subscribe(handler);
        }
        return this.data.stateWatcher;
    },

    entity(entityOptions: StorageEntityOptionsType) {
        const hokku: HokkuType = this;

        return function (target: any) {
            // hokkuStorageEngineDataType
            target.prototype._hokku_storage_engine_ = target.prototype._hokku_storage_engine_ || {};
            target.prototype._hokku_storage_engine_.conn = null;
            target.prototype._hokku_storage_engine_.entityOptions = entityOptions;

            target.prototype.put = function () {
                if (hokku.data.storage) {
                    return hokku.data.storage
                        .then((driver: StorageDriverType): void => {
                            return driver.put(this, target.prototype._hokku_storage_engine_)
                        })
                }
                return Promise.resolve();
            };

            target.pull = function (query: StorageSearchQueryType) {
                if (hokku.data.storage) {
                    return hokku.data.storage
                        .then((driver: StorageDriverType): void => {
                            return driver.pull(query, target.prototype._hokku_storage_engine_)
                        })
                }
                return Promise.resolve();
            };

            target.get = function (id: string) {
                if (hokku.data.storage) {
                    return hokku.data.storage
                        .then((driver: StorageDriverType): void => {
                            return driver.get(id, target.prototype._hokku_storage_engine_)
                        })
                }
                return Promise.resolve();
            };

            target.update = function (id: string, values: any) {
                if (hokku.data.storage) {
                    return hokku.data.storage
                        .then((driver: StorageDriverType): void => {
                            return driver.update(id, values, target.prototype._hokku_storage_engine_)
                        })
                }
                return Promise.resolve();
            }
        }
    },

    field(name: ?string) {
        return function (target: any, property: string, desc: any) {
            target._hokku_storage_engine_ = target._hokku_storage_engine_ || {};
            target._hokku_storage_engine_.fields = target._hokku_storage_engine_.fields || {};
            target._hokku_storage_engine_.fields[property] = name || property;

            desc.writable = true;

            return desc;
        }
    }
};

export default HokkuPrototype
