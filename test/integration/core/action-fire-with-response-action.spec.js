import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire with response action', (done) => {

        const {hook, act} = Hokku();

        const rec = act('REC');
        const res = act('RES');

        hook(rec, action => {

            expect(action.type).to.deep.equal('REC');
            expect(action.payload).to.deep.equal('some-data');

            action.response('this-is-response-data');
        });

        hook(res, action => {

            expect(action.type).to.deep.equal('RES');
            expect(action.payload).to.deep.equal('this-is-response-data');

            done();
        });

        new Hokku({
            ready() {
                rec('some-data', {
                    responseAction: res
                }).fire();
            }
        })

    })
});
