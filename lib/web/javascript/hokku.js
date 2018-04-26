// @flow
import Hokku from '../../core/javascript/hokku';
import {injectPlugins} from '../../core/javascript/hokkuModuleBuilder';
import ActionGate from './plugins/actionGate';

import ReactRootDecoratorFactory from './react/rootDecorator';
import decoratorHokkuUIReactContainerFactory from './react/containerDecorator';

Hokku.React = {
    Root: ReactRootDecoratorFactory(Hokku),
    Container: decoratorHokkuUIReactContainerFactory(Hokku)
};

const plugins = [ActionGate];

export default injectPlugins(Hokku, plugins);
