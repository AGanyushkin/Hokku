import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action in hokku instance', (done) => {

        const {hook, def} = Hokku();

        const ia1 = def('ACTION-1');
        const ia2 = def('ACTION-2');

        hook(ia1, action => {
            ia2(123);
        });

        hook(ia2, action => {
            expect(action).to.deep.equal(
                {
                    type: 'ACTION-2',
                    payload: 123
                }
            );
            done();
        });

        new Hokku({
            ready() {
                ia1();
            }
        })

    })
});
