import Hokku from 'hokku-web';
import React from 'react';
import {doInc, doDec, setCounterValue} from './actions';

@Hokku.React.Root
@Hokku.React.Container(
    {
        counter: 0,
        doInc,
        doDec
    },
    Hokku.switcher({
        [setCounterValue]: payload => ({counter: payload})
    })
)
class CoutnerUI extends React.Component {
    render() {
        return (
            <div>
                <div>Counter = {this.props.counter}</div>
                <button onClick={this.props.doInc}>do increment</button>
                <button onClick={this.props.doDec}>do decrement</button>
            </div>
        )
    }
}
