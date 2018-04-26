
import Hokku from '../../../lib/core/javascript/hokku'

describe('action-chain-call', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should call all actions in chain', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
            }
        });

        hook('A_1', action => {
            fire({type: 'A_2'});
        });

        hook('A_2', action => {
            fire({type: 'A_3'});
        });

        hook('A_3', action => {
            done();
        });
    })
});
