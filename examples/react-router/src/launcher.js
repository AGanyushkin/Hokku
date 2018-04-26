import Hokku from 'hokku-web';
import UIRoot from './ui/root';
import {gotoPage1, gotoPage2} from './actions';

const {hook} = new Hokku({});

hook(gotoPage2)
    .delay(1000)
    .subscribe(() => gotoPage1());
