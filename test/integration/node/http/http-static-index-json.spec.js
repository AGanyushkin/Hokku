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
                    port: 7846,
                    static: path.resolve(__dirname, 'staticFiles'),
                    staticIndex: 'index.json'
                },
                ready() {

                    fetch('http://localhost:7846/')
                        .then(res => res.json())
                        .then(res => {
                            expect(res).to.deep.equal({
                                'field 1': 'value 1',
                                'field 2': 'value 2'
                            });
                            resolve();
                        })
                        .catch(reject)

                }
            })

        })
    })

});
