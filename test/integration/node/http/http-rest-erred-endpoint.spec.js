import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http rest erred endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should handle fail response', () => {
        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                http: {
                    port: 7848
                },
                ready() {

                    fetch('http://localhost:7848/api/entity')
                        .then(res => {
                            expect(res.ok).to.be.false;
                            expect(res.status).to.be.equal(500);
                            resolve();
                        })
                        .catch(reject)

                }
            });

            hook('HTTP:GET:/entity', e => {
                fire(e.failAction())
            })

        })
    })

});
