import Hokku from 'hokku-node';
import {doDec, doInc, setCounterValue, getCounterValue} from './actions';

const {hook, select} = new Hokku({
    pipe: true,
    state: {
        counter: 0
    },
    reducer: Hokku.switcher({
        [doInc]: (payload, state) => ({counter: state.counter + 1}),
        [doDec]: (payload, state) => ({counter: state.counter - 1})
    })
});

hook([doInc, doDec, getCounterValue], e =>
    setCounterValue({counter: select().counter})
);
