import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action without type', (done) => {

        const {hook, def} = Hokku();

        const a1 = def();
        const a2 = def();

        hook(a1, action => {
            a2();
        });

        hook(a2, action => {
            done();
        });

        new Hokku({
            ready() {
                a1();
            }
        })

    })
});
