import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('pipe-discovery-app-split', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const k1 = new Hokku({
                app: 'com.test.app100',
                service: 'srv1',
                pipe: {
                    port: 18717,
                    discovery: {
                        port: 24927
                    }
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
                app: 'com.test.app101',
                service: 'srv2',
                pipe: {
                    port: 18727,
                    discovery: false,
                    discoveryBeacon: {
                        port: 24927
                    }
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
