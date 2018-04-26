import chai from 'chai';
const expect = chai.expect;

import Rx from 'rxjs/Rx'

import Hokku from '../../../lib/core/javascript/hokku'

describe('initialization', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('initialize multiple instances', (done) => {

        const hokku1 = new Hokku({
            service: 'service-1'
        });

        const hokku2 = new Hokku({
            service: 'service-2'
        });

        hokku1.hook(Hokku.ACTIONS.STARTUP, action => {
            hokku1.fire({type: 'T_1'});
        });

        hokku2.hook(Hokku.ACTIONS.STARTUP, action => {
            hokku2.fire({type: 'T_2'});
        });

        Rx.Observable.combineLatest(
            hokku1.hook('T_1'),
            hokku2.hook('T_2'),
            (s1, s2) => ({type: 'RES', s1, s2})
        )
            .subscribe(action => {
                expect(action).to.deep.equal(
                    {
                        type: 'RES',
                        s1: {type: 'T_1'},
                        s2: {type: 'T_2'}
                    }
                );
                done();
            })
    })
});
