import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http rest get without content endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should processed by js', () => {
        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                http: {
                    port: 7850
                },
                ready() {

                    fetch('http://localhost:7850/api/entity')
                        .then(res => {
                            expect(res.ok).to.be.true;
                            expect(res.status).to.be.equal(200);
                            resolve();
                        })
                        .catch(reject)

                }
            });

            hook('HTTP:GET:/entity', e => {
                fire(e.okAction(''))
            })

        })
    })

});
