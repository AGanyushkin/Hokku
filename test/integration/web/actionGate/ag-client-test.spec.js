import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('ag-client-test', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                actionGate: {
                    port: 9348
                },
                ready() {
                    fire({type: 'A'})
                }
            });

            hook('B', action => {
                try { // todo, strange method
                    expect(
                        action.payload
                    ).to.deep.equal(
                        {type: 'A'}
                    );
                } catch (e) {
                    reject(e);
                }
                resolve();
            });

        })
    })

});
