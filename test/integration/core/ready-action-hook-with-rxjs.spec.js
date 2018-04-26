
import Hokku from '../../../lib/core/javascript/hokku'

describe('ready-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should send ready action after initialization with rxjs hook', (done) => {

        const {hook} = new Hokku({});

        hook(Hokku.ACTIONS.STARTUP)
            .subscribe(action => done());

    })
});
