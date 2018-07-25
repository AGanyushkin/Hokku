import Hokku from 'hokku-node';
import {incAction, decAction} from './actions';

const {hook, fire, select} = new Hokku({
    http: {
        port: 7700
    },
    state: {
        counter: 0
    },
    reducer: Hokku.switcher({
        [incAction]: (payload, state) => ({counter: state.counter + 1}),
        [decAction]: (payload, state) => ({counter: state.counter - 1})
    })
});

hook(incAction, e =>
    fire(e.ok({counter: select().counter}))
);

hook(decAction, e =>
    fire(e.ok({counter: select().counter}))
);
