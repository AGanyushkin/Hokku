// @flow
import Hokku from '../../core/javascript/hokku';
import {injectPlugins} from '../../core/javascript/hokkuModuleBuilder';
import ActionGate from './plugins/actionGate';

import ReactRootDecoratorFactory from './react/rootDecorator';
import decoratorHokkuUIReactContainerFactory from './react/containerDecorator';

const plugins = [ActionGate];

export {
    Switcher
} from '../../core/javascript/hokku';

export const ReactRoot = ReactRootDecoratorFactory(Hokku);
export const ReactContainer = decoratorHokkuUIReactContainerFactory(Hokku);

export default injectPlugins(Hokku, plugins);
