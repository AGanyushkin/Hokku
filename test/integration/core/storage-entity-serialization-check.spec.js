import Hokku from '../../../lib/core/javascript/hokku'
import chai from 'chai';
const expect = chai.expect;

describe('storage-entity-serialization-check', () => {

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
                        const entity = new TestEntity();

                        expect(
                            JSON.stringify(entity)
                        ).to.be.equal(
                            '{"id":1,"name":2}'
                        );

                        res();
                    } catch (e) {
                        rej(e);
                    }
                }
            })

        })
    })
});
