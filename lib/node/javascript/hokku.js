// @flow
import Hokku from '../../core/javascript/hokku';
import {injectPlugins} from '../../core/javascript/hokkuModuleBuilder';
import HttpGateway from './plugins/httpGateway';
import Pipe from './plugins/pipe';
import ActionGate from './plugins/actionGate';
import storagePlugin from './plugins/storage';

const plugins = [
    HttpGateway,
    Pipe,
    ActionGate,
    storagePlugin
];

export {
    Switcher
} from '../../core/javascript/hokku';

export default injectPlugins(Hokku, plugins);
