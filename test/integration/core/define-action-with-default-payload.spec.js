import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action with default payload', (done) => {

        const {hook, act, fire} = Hokku();

        const ia1 = act('ACTION-1', payload => (payload || 777));
        const ia2 = act('ACTION-2', payload => (payload || 888));

        hook(ia1, action => {
            expect(action.type).to.deep.equal('ACTION-1');
            expect(action.payload).to.deep.equal(777);

            ia2(123).fire();
        });

        hook(ia2, action => {
            expect(action.type).to.deep.equal('ACTION-2');
            expect(action.payload).to.deep.equal(123);

            done();
        });

        new Hokku({
            ready() {
                fire(ia1());
            }
        })

    })
});
