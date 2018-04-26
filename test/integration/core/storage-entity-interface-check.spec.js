import Hokku from '../../../lib/core/javascript/hokku'
import chai from 'chai';
const expect = chai.expect;

describe('storage-entity-interface-check', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should store all meta info in the Entity class', () => {
        return new Promise((res, rej) => {

            const {entity, field} = Hokku({});

            @entity({options: true})
            class TestEntity {
                @field('testid') id = 1;
                @field() name = 2;
            }

            new Hokku({
                ready() {
                    try {
                        expect(
                            TestEntity.pull
                        ).to.be.a('function');

                        expect(
                            TestEntity.prototype._hokku_storage_engine_
                        ).to.deep.equal(
                            {
                                fields: {id: 'testid', name: 'name'},
                                conn: null,
                                entityOptions: {options: true}
                            }
                        );

                        const entity = new TestEntity();

                        expect(entity.id).to.be.equal(1);
                        expect(entity.name).to.be.equal(2);
                        expect(entity.put).to.be.a('function');

                        expect(
                            entity.put()
                        ).to.be.a('Promise');

                        expect(
                            TestEntity.pull(query => null)
                        ).to.be.a('Promise');

                        res();
                    } catch (e) {
                        rej(e);
                    }
                }
            })

        })
    })
});
