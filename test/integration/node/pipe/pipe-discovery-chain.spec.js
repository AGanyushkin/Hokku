import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;

describe('pipe-discovery-chain', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const k1 = new Hokku({
                app: 'com.test.app2',
                service: 'srv1',
                pipe: {
                    port: 17718,
                    discovery: {
                        port: 13458
                    }
                },
                ready() {
                    setTimeout(() => {
                        k1.fire({type: 'A'})
                    }, 5000)
                }
            });

            k1.hook('C', action => {
                resolve();
            });

            const k2 = new Hokku({
                app: 'com.test.app2',
                service: 'srv2',
                pipe: {
                    port: 17728,
                    discovery: false,
                    discoveryBeacon: {
                        port: 13458
                    }
                },
                ready() {
                }
            });

            k2.hook('A', action => {
                k2.fire({type: 'B'});
            });

            const k3 = new Hokku({
                app: 'com.test.app2',
                service: 'srv3',
                pipe: {
                    port: 17729,
                    discovery: false,
                    discoveryBeacon: {
                        port: 13458
                    }
                },
                ready() {
                }
            });

            k3.hook('B', action => {
                k3.fire({type: 'C'});
            });

        })
    })

});
