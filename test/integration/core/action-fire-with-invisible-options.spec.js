import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire with invisible options', (done) => {

        const {hook, act} = Hokku();

        const ia1 = act('ACTION-1');
        const ia2 = act('ACTION-2');

        hook(ia1, action => {

            expect(action.type).to.deep.equal('ACTION-1');
            expect(action.payload).to.deep.equal(123);
            expect(action.opts()).to.deep.equal(77);

            ia2(2, {
                invisible: {key: 1, t: 3}
            }).fire();
        });

        hook(ia2, action => {

            expect(action.type).to.deep.equal('ACTION-2');
            expect(action.payload).to.deep.equal(2);
            expect(action.opts().key).to.deep.equal(1);
            expect(action.opts().t).to.deep.equal(3);

            done();
        });

        new Hokku({
            ready() {
                ia1(123, {
                    invisible: 77
                }).fire();
            }
        })

    })
});
