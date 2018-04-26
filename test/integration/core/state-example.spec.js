import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('state', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('state example', (done) => {

        const aAdd = Hokku.def();

        const {hook, fire, select} = new Hokku({
            state: 1,
            reducer: (type, payload, state) => {
                if (aAdd.is(type)) {
                    return payload + state;
                }
                return state;
            },
            ready() {
                fire(aAdd(2));
            }
        });

        hook(aAdd, action => {
            expect(select()).to.deep.equal(3);
            done();
        });

    })
});
