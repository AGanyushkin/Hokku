import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action with payload preprocessing', (done) => {

        const a1 = Hokku.def('ACTION-1', payload =>
            Object.assign({}, payload, {testF: 1})
        );

        const {hook} = new Hokku({
            ready: (hokku) => {
                hokku.fire(a1({someData: 9}));
            }
        });

        hook(a1, action => {
            expect(action).to.deep.equal(
                {
                    type: 'ACTION-1',
                    payload: {
                        someData: 9,
                        testF: 1
                    }
                }
            );
            done();
        });

    })
});
