import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('pipe-direct-connect', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const k1 = new Hokku({
                app: 'com.test.app4',
                service: 'srv1',
                pipe: {
                    port: 17819,
                    discoveryBeacon: false,
                    discovery: false
                },
                ready() {
                    setTimeout(() => {
                        k1.fire({type: 'A'})
                    }, 1000)
                }
            });

            k1.hook('B', action => {
                resolve();
            });

            const k2 = new Hokku({
                app: 'com.test.app4',
                service: 'srv2',
                pipe: {
                    port: 17829,
                    connectTo: {host: 'localhost', port: 17819},
                    discovery: false,
                    discoveryBeacon: false
                },
                ready() {
                }
            });

            k2.hook('A', action => {
                k2.fire({type: 'B'});
            });

        })
    })

});
