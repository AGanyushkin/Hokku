import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;
import SocketIOClient from 'socket.io-client';

describe('ag-server-send-action-with-prefix', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                app: 'com.test.app1',
                service: 'srv1',
                actionGate: {
                    port: 3784,
                    prefix: 'API/'
                }
            });

            hook('API/A', action => {
                fire({type: 'XXX'});
                fire({type: 'API/B'});
            });

            const url = 'http://localhost:3784';
            const socket = SocketIOClient(url);

            socket.on('connect', () => {
                socket.emit('ACTION_GATE_TRANSPORT', {type: 'API/A'});
            });

            socket.on('ACTION_GATE_TRANSPORT', (data) => {
                expect(data).to.deep.equal({type: 'API/B'});
                resolve();
            });
        })
    })

});
