import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('samples', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('sample mapping', (done) => {

        const a1 = Hokku.def('A_1');
        const a3 = Hokku.def('A_3');
        const a5 = Hokku.def('A_5');
        const a6 = Hokku.def('A_6');

        const {hook, fire, samples} = new Hokku({
            ready() {
                fire(a1());
            }
        });

        samples({
            A_1: {type: 'A_2'},
            A_2: () => a3(),
            A_3: Promise.resolve({type: 'A_4'}),
            A_4: [a5(), a6()],
            A_6: Promise.all([Promise.resolve({type: 'A_7'}), Promise.resolve({type: 'A_8'})]),
            A_8: [Promise.resolve({type: 'A_9'}), Promise.resolve({type: 'A_10'})],
            A_10: {type: 'A_LAST'}
        });

        hook('A_LAST', action => {
            done();
        });
    })
});
