// @flow
import Rx from 'rxjs/Rx';
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
    StateWatcherHandlerType,
    ActionContextType,
    ActionOptionsType
} from './types/interface';
import type {
    StorageDriverType,
    StorageEntityOptionsType,
    StorageSearchQueryType,
    EntityTargetDescType,
    EntityTargetType,
    PayloadBuildType,
    EntityTargetValueType
} from './types/core';
import * as u from './util';
import {applyReducer, applySamples, applyPlugins, fireActionToActPoolMap} from './core'

const HokkuPrototype = {
    setState(state: StateType): void {
        if (state === undefined) throw new Error('State must not be undefined!');
        this.data.state = state
    },

    setReducer(reducer: ReducerType): void {
        if (!u.isReducer(reducer)) {
            throw new Error('Reducer must ba a reducer!');
        }
        this.data.reducer = reducer
    },

    select(selector: StateSelectorType): StateType {
        // todo,  return copy ?
        // todo, if selector is map then build "mapSelector": {v1 : state => state.v1}

        if (u.isSelector(selector)) {
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

            if (u.isHookHandler(handler)) {
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

        if (u.isList(actionTypeOrTypes)) {
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
                if (!u.isAction(action)) {
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

    context(pref: string, parentContext: ?ActionContextType): ActionContextType {
        const core = this;

        const prefix = parentContext ? `${parentContext.prefix}${pref}` : pref;

        let prefixHandler = (id: ?string) => {
            return core.act(`${prefix}${id}`)
        };

        prefixHandler.prefix = prefix;

        return prefixHandler;
    },

    act(theType: ?string, theTransform: ?PayloadBuildType): ActionCreatorType {
        const core = this;
        const {type, transform} = u.getActArguments(arguments);

        function _createAction(data: PayloadType = undefined, opts: ?ActionOptionsType): ActionType {
            const fire = function _createActionFire(additionalData: ?PayloadType): Promise {
                if (u.isObject(additionalData) && u.isObject(data)) {
                    this.payload = transform({
                        ...data,
                        ...additionalData
                    });
                } else {
                    this.payload = transform(additionalData || data);
                }
                return core.fire(this);
            };

            const proto = {
                opts(): ActionOptionsType {
                    return opts && opts.invisible || {};
                },
                response(data: PayloadType): Promise {
                    return (
                        (opts && opts.responseAction && opts.responseAction(data).fire()) ||
                        (opts && opts.responseFunc && opts.responseFunc(data)) // todo, wrap to promise ?
                    ) || Promise.resolve(null);
                }
            };

            const action = Object.create(proto);

            proto.fire = fire.bind(action);

            action.type = type;
            action.payload = transform(data);

            if (opts && opts.visible) {
                let vis = u.isObject(opts.visible) ? opts.visible : {additionalInfo: opts.visible};

                for (let k in vis) {
                    if (k !== 'type' && k !== 'payload') {
                        action[k] = vis[k];
                    }
                }
            }
            return action;
        }

        _createAction.toString = (): string => type;
        _createAction.is = (_type: string): boolean => type === `${_type}`;
        _createAction.fire = (data: PayloadType, opts: ?ActionOptionsType): Promise => {
            return _createAction(data, opts).fire();
        };
        return _createAction;
    },

    samples(mapping: SampleActionSetType): void {
        if (u.isSampleActionSet(mapping) || (mapping === null)) {
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
        if (u.isFunction(handler)) {
            this.data.stateWatcher
                .subscribe(handler);
        }
        return this.data.stateWatcher;
    },

    entity(entityOptions: StorageEntityOptionsType) {
        const hokku: HokkuType = this;

        return function (target: EntityTargetType) {
            // HokkuStorageEngineDataType
            // eslint-disable-next-line camelcase
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

            target.update = function (id: string, values: EntityTargetValueType) {
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
        return function (target: EntityTargetType, property: string, desc: EntityTargetDescType) {
            // eslint-disable-next-line camelcase
            target._hokku_storage_engine_ = target._hokku_storage_engine_ || {};
            target._hokku_storage_engine_.fields = target._hokku_storage_engine_.fields || {};
            target._hokku_storage_engine_.fields[property] = name || property;

            desc.writable = true;

            return desc;
        }
    }
};

export default HokkuPrototype
