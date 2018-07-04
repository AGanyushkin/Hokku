import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'

describe('fire-action', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('action fire with response function and enriched resp data', (done) => {

        const {hook, act} = Hokku();

        const rec = act('REC');
        const res = act('RES');

        hook(rec, action => {

            expect(action.type).to.deep.equal('REC');
            expect(action.payload).to.deep.equal('some-data');

            action.response({v : 2});
        });

        hook(res, action => {

            expect(action.type).to.deep.equal('RES');
            expect(action.payload).to.deep.equal({f: 1, v: 2});

            done();
        });

        new Hokku({
            ready() {
                rec('some-data', {
                    responseFunc: res({f: 1}).fire
                }).fire();
            }
        })

    })
});
