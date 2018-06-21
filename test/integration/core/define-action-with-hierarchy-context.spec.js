import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('def-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('define action with hierarchy context', (done) => {

        const {hook, context} = Hokku();

        const sAPI = context('SERVER/');
        const auth = context('AUTH/', sAPI);

        const doLogin = auth('LOGIN');

        hook(doLogin, action => {
            console.log(JSON.stringify(action));
            expect(action.type).to.deep.equal('SERVER/AUTH/LOGIN');

            done();
        });

        new Hokku({
            ready() {
                doLogin().fire();
            }
        })

    })
});
