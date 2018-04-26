import path from 'path';
import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http static endpoint with index file', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should handle index endpoint', () => {
        return new Promise((resolve, reject) => {

            new Hokku({
                http: {
                    port: 7845,
                    static: path.resolve(__dirname, 'staticFiles')
                },
                ready() {

                    fetch('http://localhost:7845/')
                        .then(res => res.text())
                        .then(res => {
                            expect(res).to.be.equal('test\n');
                            resolve();
                        })
                        .catch(reject)

                }
            })

        })
    })

});
