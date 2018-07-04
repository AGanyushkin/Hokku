import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('hooks', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('multiple hooks for action with callback', (done) => {

        const {act} = Hokku();

        const state = {
            a1: 0
        };

        function cbActionHandler(action) {
            state[action.type] = (state[action.type] || 0) + 1;
            if (state.a1 === 2) done();
        }

        const a1 = act('a1');

        const {hook, fire} = new Hokku({
            ready() {
                fire(a1());
            }
        });

        hook(a1, cbActionHandler);

        hook(a1, cbActionHandler);

    })
});
