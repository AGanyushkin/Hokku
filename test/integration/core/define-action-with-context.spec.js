import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action with context', (done) => {

        const {hook, context} = Hokku();

        const sAPI = context('SERVER/');
        const auth = context('AUTH/');

        const getData = sAPI('GET-DATA');
        const doLogin = auth('LOGIN');

        hook(doLogin, action => {
            expect(action.type).to.deep.equal('AUTH/LOGIN');

            getData('args').fire();
        });

        hook(getData, action => {

            expect(action.type).to.deep.equal('SERVER/GET-DATA');
            expect(action.payload).to.deep.equal('args');

            done();
        });

        new Hokku({
            ready() {
                doLogin().fire();
            }
        })

    })
});
