import Hokku from '../../../../lib/node/javascript/hokku';
import uuid from 'uuid/v4';
import chai from 'chai';
const expect = chai.expect;

describe('storage-rethinkdb-simple-check', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', function () {
        this.timeout(10e3);

        return new Promise((resolve, reject) => {

            const {entity, field} = Hokku({});

            @entity()
            class Entity {
                @field('id') _id = uuid();
                @field() name;
                extField = 123;

                constructor(name) {
                    this.name = name;
                }
            }

            new Hokku({
                storage: true,
                ready() {
                    const entity1 = new Entity('Example Name 1');
                    const entity2 = new Entity('Example Name 2');

                    Promise.all([entity1.put(), entity2.put()])
                        .then(() => Entity.pull((q, r) => q.filter(r.row('id').eq(entity1._id))))
                        .then(result => {
                            expect(result.length).to.be.equal(1);
                            expect(result[0].name).to.be.equal(entity1.name);
                            expect(result[0].extField).to.be.undefined;
                        })
                        .then(() => Entity.get(entity2._id))
                        .then(result => {
                            expect(result.name).to.be.equal(entity2.name);
                            expect(result.extField).to.be.undefined;
                        })
                        .then(resolve)
                        .catch(reject)
                }
            })
        })
    })

});
