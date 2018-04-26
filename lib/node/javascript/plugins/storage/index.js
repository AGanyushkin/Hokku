// @flow
import type {
    HokkuType,
    PluginObjectType,
    ActionType
} from '../../../../core/javascript/types/interface';

import rethinkDBDriverFactory from './rethinkDBDriver';
import type {
    StorageDriverFactoryType
} from '../../../../core/javascript/types/core';

function initPlugin(hokku: HokkuType) {
    const driverFactory: StorageDriverFactoryType =
        hokku.opts.storage.driver === 'rethinkdb' ?
            rethinkDBDriverFactory :
            hokku.opts.storage.driver;

    hokku.data.storage = driverFactory(hokku);
}

export default function storagePlugin(hokku: HokkuType): Promise<PluginObjectType> {
    if (hokku.opts.storage) {

        initPlugin(hokku);

        const plugin = {
            hook(action: ActionType): Promise<ActionType> {
                return Promise.resolve(action);
            }
        };

        return Promise.resolve(plugin)
    }
    return Promise.resolve(null);
}
