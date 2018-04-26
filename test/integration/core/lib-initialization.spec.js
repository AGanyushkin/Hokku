import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('external libraries', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('initialization', (done) => {

        const {lib} = new Hokku({
            lib: {
                testLib1: Promise.resolve('libriry-instance-1')
            },
            ready() {
                expect(lib('testLib1')).to.be.equal('libriry-instance-1');
                done();
            }
        });

    })
});
