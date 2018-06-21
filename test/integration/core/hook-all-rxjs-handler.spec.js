import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('hooks', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('hook all rxjs handler', (done) => {

        const {act} = Hokku();

        const state = {
            a1: false,
            a2: false
        };

        function actionHandler(action) {
            state[action.type] = true;
            if (state.a1 && state.a2) done();
        }

        const a1 = act('a1');
        const a2 = act('a2');

        const {hookAll, fire} = new Hokku({
            ready() {
                fire(a1());
                fire(a2());
            }
        });

        hookAll()
            .subscribe(actionHandler)

    })
});
