import Hokku from '../../../../lib/node/javascript/hokku';
import fetch from 'node-fetch';
import chai from 'chai';
const expect = chai.expect;

describe('http rest get endpoint', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should processed by js', () => {
        return new Promise((resolve, reject) => {

            const {hook, fire} = new Hokku({
                http: {
                    port: 7847
                },
                ready() {

                    fetch('http://localhost:7847/api/entity')
                        .then(res => res.json())
                        .then(res => {
                            expect(res).to.deep.equal({
                                'id': '123'
                            });
                            resolve();
                        })
                        .catch(reject)

                }
            });

            hook('HTTP:GET:/entity', e => {
                fire(e.okAction(
                    {'id': '123'}
                ))
            })

        })
    })

});
