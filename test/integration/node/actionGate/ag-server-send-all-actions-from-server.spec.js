import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;
import SocketIOClient from 'socket.io-client';

describe('ag-server-send-all-actions-from-server', () => {

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
                    port: 3849
                }
            });

            hook('A', action => {
                fire({type: 'B'});
            });

            const url = 'http://localhost:3849';
            const socket = SocketIOClient(url);

            socket.on('connect', () => {
                socket.emit('ACTION_GATE_TRANSPORT', {type: 'A'});
            });

            socket.on('ACTION_GATE_TRANSPORT', (data) => {
                expect(data).to.deep.equal({type: 'B'});
                resolve();
            });
        })
    })

});
