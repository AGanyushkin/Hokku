import Hokku from 'hokku-web';
import React from 'react';
import Helper from './help';
import {doInc, doDec, setCounterValue} from './actions';

@Hokku.React.Root
@Hokku.React.Container(
    {
        counter: 1,
        doInc,
        doDec
    },
    Hokku.switcher({
        [setCounterValue]: (payload, state) => ({counter: payload})
    })
)
class Welcome extends React.Component {
    render() {
        return (
            <div>
                <div>Hello from React!, data = {this.props.counter}</div>
                <button onClick={this.props.doInc}>increment</button>
                <button onClick={this.props.doDec}>decrement</button>

                <Helper message="test help message">Some text here...</Helper>
            </div>
        )
    }
}

const {hook} = new Hokku({});

hook(doInc, action =>
    fetch('http://localhost:7700/api/do/inc')
        .then(res => res.json())
        .then(res => setCounterValue(res.counter))
);

hook(doDec, action =>
    fetch('http://localhost:7700/api/do/dec')
        .then(res => res.json())
        .then(res => setCounterValue(res.counter))
);
