import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire like props action creator with predefined payload 2ways', (done) => {

        const {hook, act} = Hokku();

        const ia1 = act('ACTION-1');
        const ia2 = act('ACTION-2');

        hook(ia1, action => {

            expect(action.type).to.deep.equal('ACTION-1');
            expect(action.payload).to.deep.equal(123);

            const propsAction2 = ia2(999).fire;

            propsAction2(777);
        });

        hook(ia2, action => {

            expect(action.type).to.deep.equal('ACTION-2');
            expect(action.payload).to.deep.equal(777);

            done();
        });

        new Hokku({
            ready() {
                const propsAction1 = ia1(123).fire;

                propsAction1();
            }
        })

    })
});
