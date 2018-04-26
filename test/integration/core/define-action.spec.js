import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action', (done) => {

        const a1 = Hokku.def('ACTION-1');
        const a2 = Hokku.def('ACTION-2');

        const {hook, fire} = new Hokku({
            ready: (hokku) => {
                hokku.fire(a1('test'));
            }
        });

        hook(a1, action => {
            expect(action).to.deep.equal(
                {
                    type: 'ACTION-1',
                    payload: 'test'
                }
            );
            fire(a2(777));
        });

        hook('ACTION-2', action => {
            expect(action).to.deep.equal(
                {
                    type: 'ACTION-2',
                    payload: 777
                }
            );
            done();
        })

    })
});
