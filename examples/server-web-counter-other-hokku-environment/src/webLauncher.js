import Hokku from 'hokku-web';
import CoutnerUI from './CoutnerUI';
import {getCounterValue} from './actions';

const {} = new Hokku({
    pipe: true,
    ready() {
        getCounterValue();
    }
});
