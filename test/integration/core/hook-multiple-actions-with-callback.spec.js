import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('hooks', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('hook multiple actions with callback', (done) => {

        const {act} = Hokku();

        const state = {
            a1: false,
            a2: false
        };

        const a1 = act('a1');
        const a2 = act('a2');

        const {hook, fire} = new Hokku({
            ready() {
                fire(a1());
                fire(a2());
            }
        });

        hook([a1, a2], action => {
            state[action.type] = true;
            if (state.a1 && state.a2) done();
        });

    })
});
