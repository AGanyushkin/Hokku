import chai from 'chai';
const expect = chai.expect;

import {Switcher} from '../../../lib/core/javascript/hokkuStatic';

describe('hokkuStatic', () => {

    describe('"switcher" method', () => {
        it('should build reducer like handler', () => {
            const result = Switcher({});

            expect(result).to.be.a.function;
            expect(result.length).to.be.equal(3);
        });

        it('should skip processing if there is not any handlers', () => {
            const reducer = Switcher({
                'A1': () => 1
            });
            const state = {
                someData: '123'
            };
            const result = reducer('A2', {}, state);

            expect(result).to.deep.equal(state);
        });

        it('should skip processing if handler is not a function', () => {
            const reducer = Switcher({
                'A1': 'invalid handler'
            });
            const state = {
                someData: '123'
            };
            const result = reducer('A1', {}, state);

            expect(result).to.deep.equal(state);
        });

        it('should handler action', () => {
            const reducer = Switcher({
                'A1': () => 2
            });
            const state = {
                someData: '123'
            };
            const result = reducer('A1', 7, state);

            expect(result).to.deep.equal(2);
        })
    })
});
