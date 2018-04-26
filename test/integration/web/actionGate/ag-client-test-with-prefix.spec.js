import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('ag-client-test-with-prefix', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                actionGate: {
                    port: 9349,
                    prefix: 'API/'
                },
                ready() {
                    fire({type: 'A'});
                    fire({type: 'X'});
                    fire({type: 'API/A'});
                }
            });

            hook('API/B', action => {
                try { // todo, strange method
                    expect(
                        action.payload
                    ).to.deep.equal(
                        {type: 'API/A'}
                    );
                } catch (e) {
                    reject(e);
                }
                resolve();
            });

        })
    })

});
