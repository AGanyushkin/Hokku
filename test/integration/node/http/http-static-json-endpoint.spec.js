import path from 'path';
import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http static json endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should handle and return static json content', () => {
        return new Promise((resolve, reject) => {

            new Hokku({
                http: {
                    port: 7843,
                    static: path.resolve(__dirname, 'staticFiles')
                },
                ready() {

                    fetch('http://localhost:7843/testJsonFile.json')
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
