import Hokku from '../../../../lib/node/javascript/hokku';
import uuid from 'uuid/v4';
import chai from 'chai';
const expect = chai.expect;

describe('storage-rethinkdb-entities-from-different-tables', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {entity, field} = Hokku({});

            @entity()
            class Entity1 {
                @field('id') _id = uuid();
            }

            @entity({table: 'altTest'})
            class Entity2 {
                @field('id') _id = uuid();
            }

            new Hokku({
                storage: true,
                ready() {
                    const e1 = new Entity1();
                    const e2 = new Entity2();

                    Promise.all([e1.put(), e2.put()])
                        .then(() => Promise.all([
                            Entity1.get(e1._id),
                            Entity2.get(e2._id)
                        ]))
                        .then(result => {
                            expect(result[0]._id).to.be.equal(e1._id);
                            expect(result[1]._id).to.be.equal(e2._id);
                        })
                        .then(resolve)
                        .catch(reject)
                }
            })
        })
    })

});
