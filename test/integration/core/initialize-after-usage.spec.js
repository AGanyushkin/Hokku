import Hokku from '../../../lib/core/javascript/hokku'

describe('initialization', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('initialize after usage', (done) => {

        const {hook} = Hokku();

        hook(Hokku.ACTIONS.STARTUP, action => done());

        const hokku = new Hokku({});

    })
});
