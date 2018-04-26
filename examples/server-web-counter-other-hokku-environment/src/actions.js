import Hokku from 'hokku-core';

const {def} = Hokku();

export const doInc = def('INCREMENT_DO');
export const doDec = def('DECREMENT_DO');
export const setCounterValue = def('COUNTER_VALUE_SET');
export const getCounterValue = def('COUNTER_VALUE_GET');
