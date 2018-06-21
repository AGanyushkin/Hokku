import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire like props action creator', (done) => {

        const {hook, act} = Hokku();

        const ia1 = act('ACTION-1');

        hook(ia1, action => {

            expect(action.type).to.deep.equal('ACTION-1');
            expect(action.payload).to.deep.equal(123);

            done();
        });

        new Hokku({
            ready() {

                const propsAction1 = ia1().fire;

                propsAction1(123);
            }
        })

    })
});
