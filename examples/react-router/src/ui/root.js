import Hokku from 'hokku-web';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Page1 from './page1';
import Page2 from './page2';

@Hokku.React.Root
class UIRoot extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path='/' component={Page1} />
                <Route path='/page2' component={Page2} />
            </Switch>
        )
    }
}
