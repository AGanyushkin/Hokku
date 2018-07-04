import chai from 'chai';
const expect = chai.expect;

import sinon from 'sinon';

import Rx from 'rxjs/Rx'
import proto from '../../../lib/core/javascript/hokkuPrototype';
import {ActionType} from '../../../lib/core/javascript/types/interface';

describe('hokkuPrototype', () => {
    describe('setState', () => {
        it('should set state', () => {
            const fakeHokku = {data: {}};
            const state = {field1: 'value-1'};

            proto.setState.call(fakeHokku, state);

            expect(fakeHokku).to.deep.equal(
                {
                    data: {
                        state: {field1: 'value-1'}
                    }
                }
            )
        });

        it('should throw exception if new state is undefined', () => {
            const fakeHokku = {data: {}};

            expect(
                () => proto.setState.call(fakeHokku)
            ).to.throw('State must not be undefined!')
        })
    });

    describe('setReducer', () => {
        it('should set reducer', () => {
            const fakeHokku = {data: {}};
            const reducer = (type, payload, state) => state;

            proto.setReducer.call(fakeHokku, reducer);

            expect(fakeHokku.data.reducer).to.be.a('function')
        });

        it('should throw exception if new reducer is not a reducer', () => {
            const fakeHokku = {data: {}};

            expect(
                () => proto.setReducer.call(fakeHokku, {})
            ).to.throw('Reducer must ba a reducer!')
        })
    });

    describe('select', () => {
        it('should throw exception if selector is not selector', () => {
            const fakeHokku = {
                data: {
                    state: 1
                }
            };

            expect(
                () => proto.select.call(fakeHokku, {})
            ).to.throw('Incorrect store selector')
        });

        it('should return full state', () => {
            const fakeHokku = {
                data: {
                    state: 1
                }
            };

            const res = proto.select.call(fakeHokku, undefined);

            expect(res).to.be.equal(1)
        });

        it('should exec selector', () => {
            const fakeHokku = {
                data: {
                    state: 1
                }
            };
            const selector = (state) => state + 1;

            const res = proto.select.call(fakeHokku, selector);

            expect(res).to.be.equal(2)
        })
    });

    describe('all', () => {
        it('should return baseWatcher if it is already created', () => {
            const fakeHokku = {
                data: {
                    baseWatcher: 777
                }
            };

            expect(
                proto.hookAll.call(fakeHokku)
            ).to.be.equal(777)
        });

        it('should create new RxStream and set baseWatcher', () => {
            const fakeHokku = {
                data: {
                    baseWatcher: null
                }
            };

            const res = proto.hookAll.call(fakeHokku);

            expect(res).to.be.an('object');
            expect(res).to.be.an.instanceof(Rx.Subject);
            expect(fakeHokku.data.baseWatcher).to.be.an.instanceof(Rx.Subject);
        })
    });

    describe('samples', () => {
        const isSampleActionSetStub = sinon.stub();

        before(() => {
            proto.__Rewire__('isSampleActionSet', isSampleActionSetStub);
        });
        after(() => {
            proto.__ResetDependency__('isSampleActionSet');
        });
        beforeEach(() => {
            isSampleActionSetStub.reset();
        });

        it('should set sample map', () => {
            isSampleActionSetStub.callsFake(() => true);

            const fakeHokku = {
                data: {}
            };
            const resAction = {type: 'Type_B', payload: 7};
            const sampleMapping = {'Type_A': resAction};

            proto.samples.call(fakeHokku, sampleMapping);

            expect(fakeHokku.data.sampleMapping).to.deep.equal(sampleMapping);
        });

        it('should fail if actionSet is incorrect set', () => {
            isSampleActionSetStub.callsFake(() => false);

            const fakeHokku = {
                data: {}
            };

            expect(
                () => proto.samples.call(fakeHokku, 123)
            ).to.throw('Incorrect sample set map')
        });

        it('should set null if pass null', () => {
            isSampleActionSetStub.callsFake(() => false);

            const fakeHokku = {
                data: {}
            };

            proto.samples.call(fakeHokku, null);

            expect(fakeHokku.data.sampleMapping).to.be.null
        })
    });

    describe('hook', () => {
        const isHookHandlerStub = sinon.stub();
        const isListStub = sinon.stub();

        before(() => {
            proto.__Rewire__('isHookHandler', isHookHandlerStub);
            proto.__Rewire__('isList', isListStub);
        });

        after(() => {
            proto.__ResetDependency__('isHookHandler');
            proto.__ResetDependency__('isList');
        });

        beforeEach(() => {
            isHookHandlerStub.reset();
            isListStub.reset();
        });

        it('should handle single action', () => {
            isHookHandlerStub.callsFake(() => false);
            isListStub.callsFake(() => false);

            const fakeHokku = {
                data: {
                    actPoolMap: {}
                }
            };
            const stream = proto.hook.call(fakeHokku, 'A_TYPE_1');

            expect(fakeHokku.data.actPoolMap.A_TYPE_1).to.be.an.instanceof(Rx.Subject);
            expect(stream).to.be.an.instanceof(Rx.Subject);
        });

        it('should handle set of actions', () => {
            isHookHandlerStub.callsFake(() => false);
            isListStub.callsFake(() => true);

            const fakeHokku = {
                data: {
                    actPoolMap: {}
                }
            };
            const stream = proto.hook.call(fakeHokku, ['A_TYPE_1', 'A_TYPE_2']);

            expect(fakeHokku.data.actPoolMap.A_TYPE_1).to.be.an.instanceof(Rx.Subject);
            expect(fakeHokku.data.actPoolMap.A_TYPE_2).to.be.an.instanceof(Rx.Subject);
            expect(stream).to.be.an.instanceof(Object);
            expect(stream.subscribe).to.be.a('function');
        });

        it('should handle handler callback', () => {
            isHookHandlerStub.callsFake(() => true);
            isListStub.callsFake(() => false);

            const fakeHokku = {
                data: {
                    actPoolMap: {}
                },
                opts: {
                    debug: false
                }
            };
            const handler = sinon.spy();
            const stream = proto.hook.call(fakeHokku, 'A_TYPE_1', action => handler(action));
            const testAction = {type: 'A_TYPE_1'};

            expect(fakeHokku.data.actPoolMap.A_TYPE_1).to.be.an.instanceof(Rx.Subject);
            expect(stream).to.be.an.instanceof(Rx.Subject);

            fakeHokku.data.actPoolMap.A_TYPE_1.next(testAction);
            expect(handler.callCount).to.be.equal(1);
            expect(handler.getCall(0).args[0]).to.deep.equal(testAction)
        })
    });

    describe('fireOnlyForCore', () => {
        const isActionStub = sinon.stub();
        const applyReducerSpy = sinon.spy();
        const applySamplesSpy = sinon.spy();

        before(() => {
            proto.__Rewire__('applyReducer', applyReducerSpy);
            proto.__Rewire__('applySamples', applySamplesSpy);
            proto.__Rewire__('u', {
                'isAction': isActionStub
            });
        });
        after(() => {
            proto.__ResetDependency__('u');
            proto.__ResetDependency__('applySamples');
            proto.__ResetDependency__('applyReducer');
        });
        beforeEach(() => {
            isActionStub.reset();
            applyReducerSpy.reset();
            applySamplesSpy.reset();
        });

        it('should handle single action', () => {
            isActionStub.callsFake(() => true);

            const fakeHokku = {
                data: {
                    init: Promise.resolve(),
                    baseWatcher: { next: sinon.spy() },
                    actPoolMap: { TEST_1: {next: sinon.spy()} }
                },
                opts: {
                    name: 'NAME_P'
                }
            };
            const testAction = {type: 'TEST_1', paylaod: 'XXX'};
            const res = proto.fireOnlyForCore.call(fakeHokku, testAction);

            expect(res).to.be.a('promise');
            return res
                .then(action => {
                    expect(action).to.deep.equal(testAction);
                    expect(isActionStub.callCount).to.be.equal(1);
                    expect(applyReducerSpy.callCount).to.be.equal(1);
                    expect(applySamplesSpy.callCount).to.be.equal(1);
                    expect(fakeHokku.data.baseWatcher.next.callCount).to.be.equal(1);
                    expect(fakeHokku.data.actPoolMap.TEST_1.next.callCount).to.be.equal(1);
                });
        });

        it('should works without defined hooks', () => {
            isActionStub.callsFake(() => true);

            const fakeHokku = {
                data: {
                    init: Promise.resolve(),
                    baseWatcher: null,
                    actPoolMap: {}
                },
                opts: {
                    name: 'NAME_P'
                }
            };
            const testAction = {type: 'TEST_1', paylaod: 'XXX'};
            const res = proto.fireOnlyForCore.call(fakeHokku, testAction);

            expect(res).to.be.a('promise');
            return res
                .then(action => {
                    expect(action).to.deep.equal(testAction);
                    expect(isActionStub.callCount).to.be.equal(1);
                    expect(applyReducerSpy.callCount).to.be.equal(1);
                    expect(applySamplesSpy.callCount).to.be.equal(1);
                });
        });

        it('should trow exception if it is not action', () => {
            isActionStub.callsFake(() => false);

            const fakeHokku = {
                data: {
                    init: Promise.resolve(),
                    baseWatcher: null,
                    actPoolMap: {}
                },
                opts: {
                    name: 'NAME_P'
                }
            };
            const res = proto.fireOnlyForCore.call(fakeHokku, 'invaid_value');

            expect(res).to.be.a('promise');
            return res
                .then(action => false)
                .catch(err => true)
                .then(r => {
                    expect(r).to.be.true
                })
        })
    });

    describe('fire', () => {
        const applyPluginsSpy = sinon.spy();

        before(() => {
            proto.__Rewire__('applyPlugins', applyPluginsSpy);
        });
        after(() => {
            proto.__ResetDependency__('applyPlugins');
        });
        beforeEach(() => {
            applyPluginsSpy.reset();
        });

        it('should apply plugins and return promise<orig action>', () => {
            const fakeHokku = {
                fireOnlyForCore: sinon.stub().callsFake(action => Promise.resolve(action))
            };

            const testAction = {type: 'TEST_FIRE', paylaod: 'XXX'};
            const res = proto.fire.call(fakeHokku, testAction);

            expect(res).to.be.a('promise');

            return res
                .then(action => {
                    expect(action).to.deep.equal(testAction);
                    expect(applyPluginsSpy.callCount).to.be.equal(1);
                    expect(applyPluginsSpy.getCall(0).args[1]).to.deep.equal(testAction);
                    expect(fakeHokku.fireOnlyForCore.callCount).to.be.equal(1);
                    expect(fakeHokku.fireOnlyForCore.getCall(0).args[0]).to.deep.equal(testAction);
                })
        });

        it('should throw promise exception', () => {
            const fakeHokku = {
                fireOnlyForCore: sinon.stub().callsFake(action => Promise.reject())
            };

            const testAction = {type: 'TEST_FIRE', paylaod: 'XXX'};
            const res = proto.fire.call(fakeHokku, testAction);

            expect(res).to.be.a('promise');

            return res
                .then(() => true)
                .catch(() => false)
                .then(isPass => {
                    if (isPass) {
                        throw new Error('Incorrect behaviour')
                    } else {
                        expect(applyPluginsSpy.callCount).to.be.equal(0);
                        expect(fakeHokku.fireOnlyForCore.callCount).to.be.equal(1);
                        expect(fakeHokku.fireOnlyForCore.getCall(0).args[0]).to.deep.equal(testAction);
                    }
                })
        })
    });

    describe('act', () => {
        const getActArgumentsStub = sinon.stub();
        const isObjectStub = sinon.stub();

        const fakeCore = {
            fire: sinon.stub()
        };

        before(() => {
            proto.__Rewire__('u', {
                'getActArguments': getActArgumentsStub,
                'isObject': isObjectStub
            });
        });
        after(() => {
            proto.__ResetDependency__('u');
        });
        beforeEach(() => {
            getActArgumentsStub.reset();
            isObjectStub.reset();
            fakeCore.fire.reset();
        });

        it('toString transformation', () => {
            const type = 'testid';

            getActArgumentsStub.callsFake(args => ({
                type, transform: payload => payload
            }));

            const actionCreator = proto.act.call(fakeCore, type);

            expect(actionCreator.toString).to.be.a.function;
            expect(actionCreator.toString()).to.be.equal(type);
            expect(`${actionCreator}`).to.be.equal(type);
        });

        it('simple action creator', () => {
            const type = 'testid';

            getActArgumentsStub.callsFake(args => ({
                type, transform: payload => payload
            }));

            const actionCreator = proto.act.call(fakeCore);

            expect(actionCreator).to.be.a.function;
            expect(actionCreator.length).to.be.equal(0); // function has optional arguments only
            expect(actionCreator.is).to.be.a.function;
            expect(actionCreator.is(type)).to.be.true;
            expect(actionCreator.is('test')).to.be.false;
            expect(actionCreator.fire).to.be.a.function;
            expect(actionCreator.fire.length).to.be.equal(2);
            expect(`${actionCreator}`).to.be.equal(type);

            const action = actionCreator('data');

            expect(action.type).to.be.equal(type);
            expect(action.payload).to.be.equal('data');
            expect(action.fire).to.be.a.function;
            expect(action.opts).to.be.a.function;
            expect(action.response).to.be.a.function;

            expect(fakeCore.fire.callCount).to.be.equal(0);
            expect(getActArgumentsStub.callCount).to.be.equal(1);
        });

        describe('fire through action fire method', () => {
            const tests = [
                {
                    inAction: { type: 'test_undefined', data: undefined },
                    outAction: { type: 'test_undefined', data: undefined },
                    firedData: undefined,
                    isObject: false
                },
                {
                    inAction: { type: 'test_x0', data: undefined },
                    outAction: { type: 'test_x0', data: 7 },
                    firedData: 7,
                    isObject: false
                },
                {
                    inAction: { type: 'test_x1', data: undefined },
                    outAction: { type: 'test_x1', data: {x: 1} },
                    firedData: {x: 1},
                    isObject: false
                },
                {
                    inAction: { type: 'test_x', data: 'DATA' },
                    outAction: { type: 'test_x', data: 'DATA' },
                    firedData: undefined,
                    isObject: false
                },
                {
                    inAction: { type: 'test_y', data: {f: 1} },
                    outAction: { type: 'test_y', data: 'DATA' },
                    firedData: 'DATA',
                    isObject: false
                },
                {
                    inAction: { type: 'test_z', data: 'DATA' },
                    outAction: { type: 'test_z', data: {f: 1} },
                    firedData: {f: 1},
                    isObject: false
                },
                {
                    inAction: { type: 'test_g', data: {f: 1} },
                    outAction: { type: 'test_g', data: {f: 2} },
                    firedData: {f: 2},
                    isObject: true
                },
                {
                    inAction: { type: 'test_k', data: {f: 1} },
                    outAction: { type: 'test_k', data: {f: 1, v: 2} },
                    firedData: {v: 2},
                    isObject: true
                }
            ];

            tests.forEach(item => {
                const _in = JSON.stringify(item.inAction.data);
                const _fired = JSON.stringify(item.firedData);
                const _out = JSON.stringify(item.outAction.data);

                it(`with data: in=${_in}, fData=${_fired}, out=${_out}`, () => {
                    getActArgumentsStub.callsFake(args => ({
                        type: item.inAction.type, transform: payload => payload
                    }));
                    fakeCore.fire.callsFake(() => Promise.resolve());
                    isObjectStub.callsFake(() => item.isObject);

                    const actionCreator = proto.act.call(fakeCore);
                    const action = actionCreator(item.inAction.data);
                    const res = action.fire(item.firedData);

                    expect(res).to.be.a('Promise');

                    expect(getActArgumentsStub.callCount).to.be.equal(1);
                    expect(fakeCore.fire.callCount).to.be.equal(1);

                    const firedAction = fakeCore.fire.getCall(0).args[0];

                    expect(firedAction).to.deep.equal(action);
                    expect(firedAction.type).to.be.equal(item.outAction.type);
                    expect(firedAction.payload).to.deep.equal(item.outAction.data);
                });
            })
        });

        it('fire through action-creator fire method', () => {
            const type = 'test_y';
            const data = 'DATA';

            getActArgumentsStub.callsFake(args => ({
                type, transform: payload => payload
            }));
            fakeCore.fire.callsFake(() => Promise.resolve());
            isObjectStub.callsFake(() => false);

            const actionCreator = proto.act.call(fakeCore);
            const res = actionCreator.fire(data);

            expect(res).to.be.a('Promise');

            expect(getActArgumentsStub.callCount).to.be.equal(1);
            expect(fakeCore.fire.callCount).to.be.equal(1);

            const firedAction = fakeCore.fire.getCall(0).args[0];

            expect(firedAction.type).to.be.equal(type);
            expect(firedAction.payload).to.deep.equal(data);
        });

        it('fire with options', () => {
            const responseActionStub = sinon.stub();

            const type = 'test_q';
            const payload = 'DATA';
            const opts = {
                visible: {arg: 1, type: 'fail-if-will-be-allied'},
                invisible: {harg: 2},
                responseFunc: () => responseActionStub()
            };

            getActArgumentsStub.callsFake(args => ({
                type, transform: payload => payload
            }));
            fakeCore.fire.callsFake(() => Promise.resolve());
            isObjectStub.callsFake(val => Object.prototype.toString.call(val) === '[object Object]');

            const actionCreator = proto.act.call(fakeCore);
            const res = actionCreator.fire(payload, opts);

            expect(res).to.be.a('Promise');

            expect(getActArgumentsStub.callCount).to.be.equal(1);
            expect(fakeCore.fire.callCount).to.be.equal(1);

            const firedAction = fakeCore.fire.getCall(0).args[0];

            expect(firedAction.type).to.be.equal(type);
            expect(firedAction.payload).to.be.equal(payload);
            expect(firedAction.arg).to.be.equal(1);
            expect(firedAction.opts()).to.deep.equal({
                harg: 2
            });

            firedAction.response();
            expect(responseActionStub.callCount).to.be.equal(1);
        })
    });

    describe('lib', () => {
        const lib1 = Math.random();
        const fakeHokku = {
            data: {
                lib: {
                    lib1
                }
            }
        };

        it('should get library by name', () => {
            const lib = proto.lib.call(fakeHokku, 'lib1');

            expect(lib).to.be.equal(lib1);
        });

        it('sholuld throw error if library name is not exists', () => {
            expect(
                () => proto.lib.call(fakeHokku, 'undefinedName')
            ).to.throw('Undefined library name "undefinedName"')
        })
    })
});
