
import Hokku from '../../../lib/core/javascript/hokku'

describe('ready-callback', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should call ready handler after initialization', (done) => {

        const hokku = new Hokku({
            ready: (hokku) => {
                done();
            }
        })

    })
});
