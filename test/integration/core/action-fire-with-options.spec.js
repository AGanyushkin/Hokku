import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire with options', (done) => {

        const {hook, act} = Hokku();

        const ia1 = act('ACTION-1');
        const ia2 = act('ACTION-2');

        hook(ia1, action => {

            expect(action.type).to.deep.equal('ACTION-1');
            expect(action.payload).to.deep.equal(123);
            expect(action.additionalInfo).to.deep.equal(77);

            ia2(2, {
                visible: {key: 1, t: 3}
            }).fire();
        });

        hook(ia2, action => {

            expect(action.type).to.deep.equal('ACTION-2');
            expect(action.payload).to.deep.equal(2);
            expect(action.key).to.deep.equal(1);
            expect(action.t).to.deep.equal(3);

            done();
        });

        new Hokku({
            ready() {
                ia1(123, {
                    visible: 77
                }).fire();
            }
        })

    })
});
