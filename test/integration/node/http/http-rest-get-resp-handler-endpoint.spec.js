import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http rest get resp handler endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should processed by js', function () {
        this.timeout(5e3);
        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                http: {
                    port: 7851
                },
                ready() {

                    fetch('http://localhost:7851/api/entity')
                        .then(res => {
                            expect(res.ok).to.be.true;
                            expect(res.status).to.be.equal(207);
                            return res.text();
                        })
                        .then(res => {
                            expect(res).to.be.equal('xyz');
                            resolve();
                        })
                        .catch(reject)

                }
            });

            hook('HTTP:GET:/entity', action => {
                fire(action.responseAction(207, 'xyz'))
            })

        })
    })

});
