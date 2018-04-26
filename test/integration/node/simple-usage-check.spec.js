
import Hokku from '../../../lib/node/javascript/hokku'

describe('simple-usage-check', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
            }
        });

        hook('A_1', action => {
            done();
        });
    })
});
