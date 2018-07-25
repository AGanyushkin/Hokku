import chai from 'chai';
const expect = chai.expect;

import Hokku, {Switcher} from '../../../lib/core/javascript/hokku'

describe('action-switcher', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('state example', (done) => {

        const {act} = Hokku({});

        const aAdd = act();

        const {hook, fire, select} = new Hokku({
            state: 1,
            reducer: Switcher({
                [aAdd]: (payload, state) => payload + state
            }),

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
