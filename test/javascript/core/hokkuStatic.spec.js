import chai from 'chai';
const expect = chai.expect;

import {action, def, switcher} from '../../../lib/core/javascript/hokkuStatic';

describe('hokkuStatic', () => {

    describe('"action" method', () => {
        const testSet = [
            {t: 'A', p: 1, res: {type: 'A', payload: 1}},
            {t: 'B', p: undefined, res: {type: 'B', payload: undefined}},
            {t: 'C', p: null, res: {type: 'C', payload: null}},
            {t: 'D', p: {w: 3}, res: {type: 'D', payload: {w: 3}}},
            {t: 'E', p: '{w: 3}', res: {type: 'E', payload: '{w: 3}'}}
        ];
        const incorrectTypeTestSet = [null, undefined, '', 0, 1, false, NaN];

        for (let test of testSet) {
            it(`should works with test: ${JSON.stringify(test)}`, () => {
                expect(
                    action(test.t, test.p)
                ).to.deep.equal(
                    test.res
                );
            });
        }

        for (let i in incorrectTypeTestSet) {
            it('should throw exception if type is not string', () => {
                try {
                    action(incorrectTypeTestSet[i], 1);
                    expect(true).to.be.equal(false, 'should fail, but works fine')
                } catch (e) {
                    expect(
                        e.message
                    ).to.deep.equal(
                        'Incorrect action type value'
                    );
                }
            });
        }
    });

    describe('"def" method', () => {
        const incorrectTypeKeys = [null, 0, 1, false, NaN, true, [], {}, ''];

        for (let i in incorrectTypeKeys) {
            const test = incorrectTypeKeys[i];

            it(`incorrect action type value "${test}"`, () => {
                try {
                    def(test);
                    expect(true).to.be.equal(false, 'should fail, but works fine')
                } catch (e) {
                    expect(
                        e.message.indexOf('Incorrect action definition with type "')
                    ).to.be.equal(
                        0
                    )
                }
            })
        }

        it('simple action', () => {
            expect(
                def('A')(1)
            ).to.deep.equal(
                {
                    type: 'A',
                    payload: 1
                }
            )
        });

        it('should handle undefined payload', () => {
            expect(
                def('A')()
            ).to.deep.equal(
                {
                    type: 'A',
                    payload: undefined
                }
            )
        });

        it('with payload preprocessing', () => {
            expect(
                def('A', p => ({field: p}))(1)
            ).to.deep.equal(
                {
                    type: 'A',
                    payload: {field: 1}
                }
            )
        });

        it('without defined type', () => {
            const actionCreator = def();

            expect(
                actionCreator(2)
            ).to.deep.equal(
                {
                    type: `${actionCreator}`,
                    payload: 2
                }
            )
        });

        it('action type is undefined', () => {
            const actionCreator = def(undefined);

            expect(
                actionCreator('ERT')
            ).to.deep.equal(
                {
                    type: `${actionCreator}`,
                    payload: 'ERT'
                }
            )
        });

        it('action type is undefined with preprocessing', () => {
            const actionCreator = def(undefined, p => ({field: p}));

            expect(
                actionCreator('ERT')
            ).to.deep.equal(
                {
                    type: `${actionCreator}`,
                    payload: {field: 'ERT'}
                }
            )
        });

        it('toString check', () => {
            const actionCreator = def('TEST');

            expect(
                `${actionCreator}`
            ).to.deep.equal(
                'TEST'
            )
        });

        it('contains true check', () => {
            const actionCreator = def('R1');

            expect(
                actionCreator.is('R1')
            ).to.deep.true
        });

        it('contains false check', () => {
            const actionCreator = def('R1');

            expect(
                actionCreator.is('R2')
            ).to.deep.false
        })
    });

    describe('"switcher" method', () => {
        it('should build reducer like handler', () => {
            const result = switcher({});

            expect(result).to.be.a.function;
            expect(result.length).to.be.equal(3);
        });

        it('should skip processing if there is not any handlers', () => {
            const reducer = switcher({
                'A1': () => 1
            });
            const state = {
                someData: '123'
            };
            const result = reducer('A2', {}, state);

            expect(result).to.deep.equal(state);
        });

        it('should skip processing if handler is not a function', () => {
            const reducer = switcher({
                'A1': 'invalid handler'
            });
            const state = {
                someData: '123'
            };
            const result = reducer('A1', {}, state);

            expect(result).to.deep.equal(state);
        });

        it('should handler action', () => {
            const reducer = switcher({
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
