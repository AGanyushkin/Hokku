// @flow
import type {
    HokkuType,
    OptionsType,
    GlobalObjectType,
    ActionType,
    SampleActionSetType,
    PayloadType,
    LibraryEntityType,
    PluginsType,
    PluginType,
    PluginObjectType
} from './types/interface'
import {
    DEFAULT_HOKKU_APPLICATION_NAME,
    DEFAULT_HOKKU_SERVICE_NAME,
    DEFAULT_HOKKU_DISCOVERY_BEACON_PORT,
    DEFAULT_HOKKU_DISCOVERY_IP_VERSION,
    DEFAULT_HOKKU_DISCOVERY_PIPE_PORT,
    DEFAULT_HOKKU_DISCOVERY_PIPE_PREFIX,
    DEFAULT_HOKKU_ACTION_GATE_HOST,
    DEFAULT_HOKKU_ACTION_GATE_PORT
} from './const'
import ACTIONS from './hokkuActions'
import {
    getPlatformGlobalObject,
    isPromiseDirtyCheck,
    isObject,
    isNull,
    isFunction,
    isString,
    isList
} from './util'

/**
 * example
    function exampleReducer(type, payload, state) {
        return Object.assign({}, state, {[type]: payload})
    }
*/

const DEFAULT_OPTS: OptionsType = {
    app: DEFAULT_HOKKU_APPLICATION_NAME,
    service: DEFAULT_HOKKU_SERVICE_NAME,
    debug: false,
    ready: (hokku: HokkuType): ?Promise<*> => {},
    reducer: null,
    state: {},
    lib: Object.create(null),
    http: {
        port: false,
        static: false,
        staticIndex: false,
        cors: {origin: '*'}
    },
    pipe: {
        port: DEFAULT_HOKKU_DISCOVERY_PIPE_PORT,
        connectTo: null,
        prefix: DEFAULT_HOKKU_DISCOVERY_PIPE_PREFIX,
        discoveryBeacon: {
            port: DEFAULT_HOKKU_DISCOVERY_BEACON_PORT,
            ipVersion: DEFAULT_HOKKU_DISCOVERY_IP_VERSION
        },
        discovery: {
            port: DEFAULT_HOKKU_DISCOVERY_BEACON_PORT,
            ipVersion: DEFAULT_HOKKU_DISCOVERY_IP_VERSION
        },
        socketServer: {
            cfg: {
                path: '/',
                serveClient: false,
                pingInterval: 1e3,
                pingTimeout: 1e4,
                cookie: false,
                transports: ['polling', 'websocket']
            }
        }
    },
    actionGate: {
        host: DEFAULT_HOKKU_ACTION_GATE_HOST,
        port: DEFAULT_HOKKU_ACTION_GATE_PORT,
        prefix: null,
        putActions: [],
        putSessionActions: [],
        socketServer: {
            cfg: {
                path: '/',
                serveClient: false,
                pingInterval: 1e3,
                pingTimeout: 1e4,
                cookie: false,
                transports: ['polling', 'websocket']
            }
        },
        syncClientStorage: true
    },
    storage: {
        driver: 'rethinkdb',
        driverOpts: {},
        host: 'localhost',
        port: 28015,
        db: 'test',
        table: 'test'
    }
};

export function buildGlobalObjectName(opts: OptionsType): string {
    const app = (opts && isString(opts.app)) ? opts.app : DEFAULT_HOKKU_APPLICATION_NAME;
    const service = (opts && isString(opts.service)) ? opts.service : DEFAULT_HOKKU_SERVICE_NAME;

    return `${app}_${service}`
}

export function getGlobalObject(key: string): HokkuType | null {
    const gObject: GlobalObjectType = getPlatformGlobalObject();

    if (typeof gObject === 'undefined') throw new Error('Unsupported platform');

    if (!gObject.hokkuSysObjectMap || !gObject.hokkuSysObjectMap.hasOwnProperty(key)) {
        return null
    }
    return gObject.hokkuSysObjectMap[key]
}

export function setGlobalObject(key: string, hokkuObject: HokkuType) {
    const gObject: GlobalObjectType = getPlatformGlobalObject();

    if (typeof gObject === 'undefined') throw new Error('Unsupported platform');

    gObject.hokkuSysObjectMap = gObject.hokkuSysObjectMap || {};
    gObject.hokkuSysObjectMap[key] = hokkuObject
}

export function onReadyEvent(hokku: HokkuType, opts: OptionsType): OptionsType { // todo, need to implement promise here
    const readyAction = {type: ACTIONS.STARTUP, payload: null};

    hokku.fire(readyAction)
        .catch((er: Error): void => undefined); // todo, maybe it is wrong approach?

    if (isFunction(opts.ready)) opts.ready(hokku);
    return opts
}

export function mergeProps(theOpts: OptionsType, defOpts: OptionsType): OptionsType {
    const _opts = isObject(theOpts) ? theOpts : {};

    const opts = {};
    const atomicItems = ['state', 'lib', 'cors'];
    const optionTrueItems = ['http', 'pipe', 'actionGate', 'storage'];
    const optionFalseItems = ['discovery', 'discoveryBeacon'];

    function getFromOptsOrDef(key: string): OptionsType {
        if (_opts && (_opts[key] || isNull(_opts[key]))) {
            return isObject(_opts[key]) ?
                Object.assign({}, _opts[key]) :
                _opts[key]
        }
        return defOpts[key]
    }

    for (let key in defOpts) {
        if (defOpts.hasOwnProperty(key)) {
            if (atomicItems.includes(key)) {
                opts[key] = getFromOptsOrDef(key)
            } else if (optionTrueItems.includes(key)) {
                if (_opts[key]) {
                    opts[key] = mergeProps((_opts && _opts[key]) || {}, defOpts[key])
                }
            } else if (optionFalseItems.includes(key)) {
                if (_opts[key] !== false) {
                    opts[key] = mergeProps((_opts && _opts[key]) || {}, defOpts[key])
                }
            } else if (isObject(defOpts[key])) {
                opts[key] = mergeProps((_opts && _opts[key]) || {}, defOpts[key])
            } else {
                opts[key] = getFromOptsOrDef(key)
            }
        }
    }
    return opts
}

export function buildOpts(_opts: OptionsType): Promise<OptionsType> {
    /* todo, need to investigate ability to have this feature in both node and browser environments.
    if (typeof _opts === 'string') {
        return fetch(_opts)
            .then((res: CommonFetchResponseType): OptionsType => res.json())
    }
    */

    if (!isObject(_opts)) throw new Error('options must be an object');

    let opts = mergeProps(_opts, DEFAULT_OPTS);

    opts.debug && console.log(JSON.stringify(opts, null, 4));
    return Promise.resolve(opts)
}

export function applyReducer(coreData: CoreDataType, action: ActionType): void {
    if (coreData.reducer) {
        const newState = coreData.reducer(action.type, action.payload, coreData.state);

        if (newState !== coreData.state) {
            coreData.state = newState;
            coreData.stateWatcher.next(coreData.state);
        }
    }
}

export function fireSampleSet(hokku: HokkuType, actionSet: SampleActionSetType, payload: PayloadType): void {
    if (actionSet) {
        switch (Object.prototype.toString.call(actionSet)) {
            case '[object Object]':
                hokku.fire(actionSet);
                break;
            case '[object Array]':
                actionSet.map((actionSet: SampleActionSetType): void => fireSampleSet(hokku, actionSet, payload));
                break;
            case '[object Promise]':
                actionSet.then((resolvedSet: SampleActionSetType): void => {
                    fireSampleSet(hokku, resolvedSet, payload);
                });
                break;
            case '[object Function]':
                fireSampleSet(
                    hokku,
                    actionSet(hokku, payload, hokku.select()),
                    payload
                );
                break;
            default:
                throw new Error('Unsupported handler type for sampleSet');
        }
    }
}

export function applySamples(hokku: HokkuType, {type, payload}: ActionType): void {
    if (hokku.data.sampleMapping) {
        if (hokku.data.sampleMapping.hasOwnProperty(type)) {
            fireSampleSet(hokku, hokku.data.sampleMapping[type], payload)
        }
    }
}

export function fireActionToActPoolMap(hokku: HokkuType, action: ActionType): void {
    let parts = action.type.split(':');

    for (let i = 0; i < parts.length; i++) {
        let act = [];

        for (let j = 0; j <= i; j++) {
            act.push(parts[j]);
        }

        act = act.join(':');
        if (hokku.data.actPoolMap[act]) {
            hokku.data.actPoolMap[act].next(action);
        }
    }
}

export function isAvailableForFireToPlugin(action: ActionType): boolean {
    // todo, skip all internal actions
    return action.type !== ACTIONS.STARTUP
}

export function applyPlugins(hokku: HokkuType, action: ActionType): void {
    if (hokku.data.plugins && isAvailableForFireToPlugin(action)) {
        let i = hokku.data.plugins.length;

        while (i--) {
            try {
                hokku.data.plugins[i].hook(action);
            } catch (e) {
                // todo, ?
            }
        }

        // return Promise.all(
        //     hokku.data.plugins.map(plugin => plugin.hook(action))
        // )
    }
}

export function libInitialization(hokku: HokkuType, opts: OptionsType): Promise<OptionsType> {
    function injectResults(array: {[string]: LibraryEntityType}, keys: Array<string>, results: Array<*>): void {
        for (let i in keys) {
            if (!keys.hasOwnProperty(i)) continue;
            array[keys[i]] = results[i]
        }
    }

    if (opts.lib) {
        const promises = [];
        const promiseKeys = [];

        for (let key in opts.lib) {
            if (opts.lib.hasOwnProperty(key)) {
                // todo, need to add object and function types as initializer value
                // currently it used for handle promise from rethinkdb this object has no right type [object Promise]
                if (isPromiseDirtyCheck(opts.lib[key])) {
                    promiseKeys.push(key);
                    promises.push(opts.lib[key])
                } else {
                    throw new Error(`Unsupported initializer type for ${key}`)
                }
            }
        }
        if (promises.length > 0) {
            return Promise.all(promises)
                .then((libSet: Array<*>): OptionsType => {
                    injectResults(hokku.data.lib, promiseKeys, libSet);
                    return opts
                })
        }
        return Promise.resolve(opts)
    }
    return Promise.resolve(opts)
}

export function pluginInitializarion(hokku: HokkuType, opts: OptionsType, plugins: PluginsType): Promise<OptionsType> {
    if (isList(plugins)) {
        return Promise.all(
            plugins.map((plugin: PluginType) => plugin(hokku))
        )
            .then((pluginObjects: Array<PluginObjectType>) => {
                hokku.data.plugins = pluginObjects.filter((pluginObject: PluginObjectType) => pluginObject !== null);
                return opts
            })
    }
    return Promise.resolve(opts)
}
