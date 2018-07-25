// @flow
import Rx from 'rxjs/Rx';
import * as c from './core';
import * as u from './util';
import HokkuPrototype from './hokkuPrototype';
import ACTIONS from './hokkuActions';
import Waiter from './waiter';
import uuid from 'uuid/v4';

import type {OptionsType, HokkuType, HokkuConstructorType, PluginsType} from './types/interface';
import type {CoreDataType} from './types/core';

export function createHokkuCoreDataObject(): CoreDataType {
    return {
        instanceId: uuid(),
        actPoolMap: {},
        baseWatcher: null,
        stateWatcher: new Rx.Subject(),
        sampleMapping: null,
        state: null,
        reducer: null,
        lib: {},
        init: new Waiter(),
        initialized: false
    }
}

export function createNewHokkuInstance(): HokkuType {
    const hokku: HokkuType = Object.create(HokkuPrototype);

    for (let funcName in HokkuPrototype) {
        if (HokkuPrototype.hasOwnProperty(funcName) && u.isFunction(hokku[funcName])) {
            hokku[funcName] = hokku[funcName].bind(hokku);
        }
    }

    hokku.data = createHokkuCoreDataObject();

    return hokku;
}

export function Hokku(_opts: OptionsType): HokkuType {
    const instanceId = c.buildGlobalObjectName(_opts);
    const self: HokkuType = c.getGlobalObject(instanceId) || createNewHokkuInstance();

    if (this instanceof Hokku) {
        if (self.data.initialized) throw new Error(`Hokku object instanceId: ${instanceId} already initialized`);

        // todo, CRITICAL! achtung!!!, need to protect following field from external usage.
        c.buildOpts(_opts)
            .then((opts: OptionsType): OptionsType => self.opts = opts)
            .then((opts: OptionsType): OptionsType => {
                if (opts.state) self.setState(opts.state);
                return opts
            })
            .then((opts: OptionsType): OptionsType => {
                if (opts.reducer) self.setReducer(opts.reducer);
                return opts
            })
            .then((opts: OptionsType): Promise<OptionsType> => c.libInitialization(self, opts))
            .then((opts: OptionsType): Promise<OptionsType> => {
                return c.pluginInitializarion(self, opts, Hokku.__hokkuSystemPluginList__)
            })
            .then((opts: OptionsType): OptionsType => c.onReadyEvent(self, opts))
            .then((opts: OptionsType): OptionsType => self.data.init.resolve())
            .catch((err: Error): void => {
                self.data.init.reject(err);
                console.log(err); // todo, !!! refactor, rebuild, rewrite it !!!
            });

        self.data.initialized = true;
    }

    c.setGlobalObject(instanceId, self);
    return self;
}

export function injectStatic(Hokku: HokkuConstructorType): HokkuConstructorType {
    Hokku.ACTIONS = ACTIONS;
    // todo, maybe action creators with dispatch wrapper, instead of fire(createAction(a,b))
    Hokku.prototype = HokkuPrototype;

    return Hokku;
}

export function injectPlugins(Hokku: HokkuConstructorType, plugins: PluginsType): HokkuConstructorType {
    Hokku.__hokkuSystemPluginList__ = plugins;
    return Hokku;
}

// HokkuCoreObject.prototype = HokkuPrototype
