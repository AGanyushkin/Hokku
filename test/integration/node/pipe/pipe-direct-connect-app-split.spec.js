import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('pipe-direct-connect-app-split', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const k1 = new Hokku({
                app: 'com.test.app200',
                service: 'srv1',
                pipe: {
                    port: 16619,
                    discoveryBeacon: false,
                    discovery: false
                },
                ready() {
                    setTimeout(() => {
                        k1.fire({type: 'A'})
                    }, 1000);
                    setTimeout(() => {
                        k1.fire({type: 'B'})
                    }, 3000);
                }
            });

            k1.hook('B', action => {
                resolve();
            });

            const k2 = new Hokku({
                app: 'com.test.app201',
                service: 'srv2',
                pipe: {
                    port: 16629,
                    connectTo: {host: 'localohst', port: 16619},
                    discovery: false,
                    discoveryBeacon: false
                },
                ready() {
                }
            });

            k2.hook('A', action => {
                reject(new Error('Received action from different application'));
            });

        })
    })

});
