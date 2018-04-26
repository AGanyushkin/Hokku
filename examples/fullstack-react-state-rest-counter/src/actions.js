import Hokku from 'hokku-core';

const {def} = Hokku();

export const doInc = def();
export const doDec = def();
export const setCounterValue = def();

export const incAction = Hokku.def('HTTP:GET:/do/inc');
export const decAction = Hokku.def('HTTP:GET:/do/dec');
