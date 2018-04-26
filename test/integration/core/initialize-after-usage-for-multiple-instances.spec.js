import Hokku from '../../../lib/core/javascript/hokku'

describe('initialization', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('initialize after usage for multiple instances', (done) => {

        const hokku1 = Hokku({app: 'application 1'});
        const hokku2 = Hokku({app: 'application 2'});

        hokku1.hook(Hokku.ACTIONS.STARTUP, action => hokku2.fire({type: 'T_1'}));
        hokku2.hook('T_1', action => done());

        new Hokku({app: 'application 1'});
        new Hokku({app: 'application 2'});

    })
});
