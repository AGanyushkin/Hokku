import path from 'path';
import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http static html/text endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should handle and return static html/text content', () => {
        return new Promise((resolve, reject) => {

            new Hokku({
                http: {
                    port: 7844,
                    static: path.resolve(__dirname, 'staticFiles')
                },
                ready() {

                    fetch('http://localhost:7844/index.html')
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
