import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action without type', (done) => {

        const a1 = Hokku.def();
        const a2 = Hokku.def();

        const {hook, fire} = new Hokku({
            ready: (hokku) => {
                hokku.fire(a1());
            }
        });

        hook(a1, action => {
            fire(a2());
        });

        hook(a2, action => {
            done();
        });

    })
});
