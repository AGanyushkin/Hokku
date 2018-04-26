import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action in hokku instance with default payload', (done) => {

        const {hook, def} = Hokku();

        const ia1 = def('ACTION-1', 777);
        const ia2 = def('ACTION-2', 888);

        hook(ia1, action => {
            expect(action).to.deep.equal(
                {
                    type: 'ACTION-1',
                    payload: 777
                }
            );
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
