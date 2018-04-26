import Hokku from '../../../../lib/node/javascript/hokku';
import chai from 'chai';
const expect = chai.expect;
import SocketIOClient from 'socket.io-client';

describe('ag-server-test', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                app: 'com.test.app1',
                service: 'srv1',
                actionGate: true
            });

            hook('A', action => {
                fire(
                    action.responseAction({type: 'B'})
                );
            });

            const url = 'http://localhost:17727';
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
