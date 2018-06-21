import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('fire action 2 ways', (done) => {

        const {hook, act} = Hokku();

        const ia1 = act('ACTION-1');
        const ia2 = act('ACTION-2');

        hook(ia1, action => {
            ia2(123).fire();
        });

        hook(ia2, action => {

            expect(action.type).to.deep.equal('ACTION-2');
            expect(action.payload).to.deep.equal(123);

            done();
        });

        const {fire} = new Hokku({
            ready() {
                fire(ia1());
            }
        })

    })
});
