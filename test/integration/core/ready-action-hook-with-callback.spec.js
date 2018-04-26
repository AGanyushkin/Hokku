
import Hokku from '../../../lib/core/javascript/hokku'

describe('ready-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should send ready action after initialization with callback hook', (done) => {

        const {hook} = new Hokku({});

        hook(Hokku.ACTIONS.STARTUP, action => {
            done();
        });
    })
});
