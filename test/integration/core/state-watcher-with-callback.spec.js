import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('state', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('state watcher with callback', (done) => {

        const {act} = Hokku();

        const toDoSomething = act();

        const {fire, stateWatcher} = new Hokku({
            state: 1,
            reducer: (type, payload, state) => {
                return 2;
            },
            ready() {
                fire(toDoSomething());
            }
        });

        stateWatcher(state => {
            expect(state).to.deep.equal(2);
            done();
        })

    })
});
