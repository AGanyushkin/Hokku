import chai from 'chai';
const expect = chai.expect;

import * as u from '../../../lib/core/javascript/util';

describe('util', () => {

    function checkTypes(func, validMap) {
        describe(`function ${func.name}`, () => {
            if (Object.prototype.toString.call(validMap) === '[object Array]') {
                validMap = validMap.reduce((acc, val) => (acc[val] = true, acc), {})
            }

            let testSet = [
                {id: 1, val: 'test', res: false},
                {id: 2, val: '', res: false},
                {id: 3, val: {}, res: false},
                {id: 4, val: null, res: false},
                {id: 5, val: 1, res: false},
                {id: 6, val: undefined, res: false},
                {id: 7, val: true, res: false},
                {id: 8, val: [1], res: false},
                {id: 9, val: [], res: false},
                {id: 10, val: function () {}, res: false},
                {id: 11, val: () => {}, res: false},
                {id: 12, val: function (x) {}, res: false},
                {id: 13, val: (x) => {}, res: false},
                {id: 14, val: 0, res: false},
                {id: 15, val: false, res: false},
                {id: 16, val: '0', res: false},
                {id: 17, val: {payload: 1}, res: false},
                {id: 18, val: {type: 'A', payload: 1}, res: false},
                {id: 19, val: {type: 'A'}, res: false},
                {id: 20, val: {type: null}, res: false},
                {id: 21, val: {type: undefined}, res: false},
                {id: 22, val: function (a,b,c) {}, res: false},
                {id: 23, val: (a,b,c) => {}, res: false},
                {id: 24, val: function (x,y) {}, res: false},
                {id: 25, val: (x,y) => {}, res: false},
                {id: 26, val: Promise.resolve(1), res: false},
                {id: 27, val: {then: () => {}}, res: false},
                {id: 28, val: NaN, res: false}
            ];

            testSet = testSet.map(test =>
                Object.keys(validMap).includes(test.id.toString()) ?
                    Object.assign(test, {res: validMap[test.id]}) :
                    Object.assign(test, {res: false})
            );

            it(`for ${func.name} check value with Object.create object`, () => {
                expect(
                    func(Object.create(null))
                ).to.equal(
                    validMap.hasOwnProperty(0) ? validMap[0] : false
                )
            });

            for (let test of testSet) {
                it(`for ${func.name} check value "${test.val}" => "${test.res}"`, () => {
                    expect(
                        func(test.val)
                    ).to.equal(
                        test.res
                    )
                })
            }
        })
    }

    checkTypes(u.getStringOrFalse, {1: 'test', 2: '', 16: '0'});
    checkTypes(u.isObject, [0, 3, 17, 18, 19, 20, 21, 27]);
    checkTypes(u.isSelector, [12, 13]);
    checkTypes(u.isTrue, [7]);
    checkTypes(u.isString, [1, 16]);
    checkTypes(u.isNumber, [5, 14]);
    checkTypes(u.isAction, [18, 19]);
    checkTypes(u.isList, [8, 9]);
    checkTypes(u.isReducer, [22, 23]);
    checkTypes(u.isHookHandler, [12, 13]);
    checkTypes(u.isPromiseDirtyCheck, [26, 27]);
    checkTypes(u.isFunction, [10, 11, 12, 13, 22, 23, 24, 25]);
    checkTypes(u.isNull, [4]);
    checkTypes(u.isSampleActionSet, [0, 3, 17, 18, 19, 20, 21, 27]);

    describe('is<env> functions check', () => {
        it('isNode should works', () => {
            const res = u.isNode();

            expect(
                Object.prototype.toString.call(res)
            ).to.equal(
                '[object Boolean]'
            );
            // todo, fix this! it is not working in browser with karma,
            // process.env.PLATFORM_ENV set as undefined
            //
            // expect(
            //     res
            // ).to.equal(
            //     process.env.PLATFORM_ENV === 'node'
            // )
        });

        it('isWeb should works', () => {
            const res = u.isWeb();

            expect(
                Object.prototype.toString.call(res)
            ).to.equal(
                '[object Boolean]'
            );
            // todo, fix this! it is not working in browser with karma,
            // process.env.PLATFORM_ENV set as undefined
            //
            // expect(
            //     res
            // ).to.equal(
            //     process.env.PLATFORM_ENV === 'browser'
            // )
        });

        it('isNode & isWeb only one should return true', () => {
            // todo, fix this! it is not working in browser with karma,
            // process.env.PLATFORM_ENV set as undefined
            //
            // expect(
            //     u.isNode() ^ u.isWeb()
            // ).to.equal(
            //     1
            // )
        });

        it('getPlatformGlobalObject should return global object', () => {
            expect(
                Object.prototype.toString.call(u.getPlatformGlobalObject())
            ).to.be.equal(
                process.env.PLATFORM_ENV === 'node' ?
                    '[object global]' :
                    '[object Window]'
            )
        });

        it('isSameType should works', () => {
            expect(u.isSameType(1, 2)).to.be.true;
            expect(u.isSameType(1, 'w')).to.be.false;
            expect(u.isSameType(null, 'w')).to.be.false;
            expect(u.isSameType(null, null)).to.be.true;
            expect(u.isSameType('null', 'null')).to.be.true;
            expect(u.isSameType({}, 'null')).to.be.false;
            expect(u.isSameType({}, null)).to.be.false;
            expect(u.isSameType({}, 1)).to.be.false;
            expect(u.isSameType({}, {})).to.be.true;
            expect(u.isSameType({}, undefined)).to.be.false;
        })
    })
});
