import chai from 'chai';
const expect = chai.expect;

import sinon from 'sinon';

import * as mod from '../../../lib/core/javascript/core';

describe('core', () => {
    describe('mergeProps', () => {

        const DEF_PROPERTY_MERGED = {
            field1: 1,
            field2: 2,
            objectField: {
                subField1: 1,
                subField2: 2
            },
            state: null,
            lib: Object.create(null)
        };
        const DEF_PROPERTY = Object.assign(
            {},
            DEF_PROPERTY_MERGED,
            {
                pipe: {
                    port: 1,
                    host: 'localhost',
                    prefix: '',
                    discovery: {
                        port: 7,
                        ipVersion: 4,
                        timeout: 1000
                    }
                }
            }
        );
        const resolvedPromiseInstance = Promise.resolve(1);

        const checks = [
            {
                name: '1',
                opts: {},
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '2',
                opts: {field1: 3},
                res: Object.assign({}, DEF_PROPERTY_MERGED, {field1: 3})
            },
            {
                name: '3',
                opts: {field1: null},
                res: Object.assign({}, DEF_PROPERTY_MERGED, {field1: null})
            },
            {
                name: '4',
                opts: {field1: undefined},
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '5',
                opts: {skipThisField: true},
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '6',
                opts: {
                    field1: true,
                    objectField: {
                        subField2: 999
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    field1: true,
                    objectField: Object.assign({}, DEF_PROPERTY_MERGED.objectField, {subField2: 999})
                })
            },
            {
                name: '7',
                opts: {
                    state: {
                        data1: 1,
                        data2: 2
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    state: {
                        data1: 1,
                        data2: 2
                    }
                })
            },
            {
                name: '8',
                opts: {
                    state: 1
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    state: 1
                })
            },
            {
                name: '9',
                opts: {
                    state: null
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    state: null
                })
            },
            {
                name: '10',
                opts: {
                    field1: {
                        data1: 1,
                        data2: 2
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    field1: {
                        data1: 1,
                        data2: 2
                    }
                })
            },
            {
                name: '11',
                opts: {
                    lib: {
                        lib1: resolvedPromiseInstance,
                        lib2: 2
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    lib: {
                        lib1: resolvedPromiseInstance,
                        lib2: 2
                    }
                })
            },
            {
                name: '12',
                opts: null,
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '13',
                opts: undefined,
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '14',
                opts: () => null,
                res: DEF_PROPERTY_MERGED
            },
            {
                name: '15',
                opts: {
                    pipe: true
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    pipe: {
                        port: 1,
                        host: 'localhost',
                        prefix: '',
                        discovery: {
                            port: 7,
                            ipVersion: 4,
                            timeout: 1000
                        }
                    }
                })
            },
            {
                name: '16',
                opts: {
                    pipe: {
                        port: 2
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    pipe: {
                        port: 2,
                        host: 'localhost',
                        prefix: '',
                        discovery: {
                            port: 7,
                            ipVersion: 4,
                            timeout: 1000
                        }
                    }
                })
            },
            {
                name: '17',
                opts: {
                    pipe: {
                        port: 2,
                        discovery: false
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    pipe: {
                        port: 2,
                        host: 'localhost',
                        prefix: ''
                    }
                })
            },
            {
                name: '18',
                opts: {
                    pipe: {
                        port: 2,
                        discovery: null
                    }
                },
                res: Object.assign({}, DEF_PROPERTY_MERGED, {
                    pipe: {
                        port: 2,
                        host: 'localhost',
                        prefix: '',
                        discovery: {
                            port: 7,
                            ipVersion: 4,
                            timeout: 1000
                        }
                    }
                })
            }
        ];

        for (let check of checks) {
            it(`mergeProps ${check.name}`, () => {
                expect(
                    mod.mergeProps(check.opts, check.defOpts || DEF_PROPERTY)
                ).to.deep.equal(
                    check.res
                );
            })
        }
    });

    describe('buildOpts', () => {
        const TEST_OBJECT = {testField: 657};

        before(() => {
            mod.default.__Rewire__('mergeProps', (opts, defopts) => Object.assign({}, opts, TEST_OBJECT));
        });

        after(() => {
            mod.default.__ResetDependency__('mergeProps');
        });

        it('should return promise with object input', () => {
            expect(
                mod.buildOpts({})
            ).to.be.a('promise')
        });

        // todo, investigate, is it required to test all following types if we are using
        // types and input data validation
        const itIsNotOptions = ['test', 1, true, NaN, undefined, () => ({})];

        for (let opt of itIsNotOptions) {
            it(`should throw error with incorrect option object type, for "${opt}"`, () => {
                expect(
                    () => mod.buildOpts(opt)
                ).to.throw('options must be an object')
            });
        }

        it('should works with input property object', () => {
            const opts = {fieldX: 1};

            return mod.buildOpts(opts)
                .then(data => {
                    expect(data).to.deep.equal(
                        Object.assign({}, opts, TEST_OBJECT)
                    )
                });
        })
    });

    describe('applyReducer', () => {
        it('should apply if reducer is reducer', () => {
            const newState = {
                test1: 1,
                test2: 2
            };
            const dataObject = {
                reducer: sinon.stub(),
                state: {
                    field: 9
                },
                stateWatcher: {
                    next: sinon.spy()
                }
            };
            const action = {
                type: 'A'
            };

            dataObject.reducer.callsFake(() => {
                return newState;
            });

            mod.applyReducer(dataObject, action);

            expect(dataObject.reducer.callCount).to.be.equal(1);
            expect(dataObject.state).to.deep.equal(newState);
            expect(dataObject.stateWatcher.next.callCount).to.be.equal(1);
            expect(dataObject.stateWatcher.next.getCall(0).args[0]).to.deep.equal(newState);
        });

        it('should skip is reducer is not reducer', () => {
            const dataObject = {
                reducer: null,
                state: {
                    field: 9
                }
            };
            const action = {
                type: 'A'
            };

            mod.applyReducer(dataObject, action);

            expect(dataObject.state).to.deep.equal({
                field: 9
            })
        });

        it('should not call stateWatcher', () => {
            const newState = {
                test1: 1,
                test2: 2
            };
            const dataObject = {
                reducer: sinon.stub(),
                state: newState,
                stateWatcher: {
                    next: sinon.spy()
                }
            };
            const action = {
                type: 'A'
            };

            dataObject.reducer.callsFake(() => {
                return newState;
            });

            mod.applyReducer(dataObject, action);

            expect(dataObject.reducer.callCount).to.be.equal(1);
            expect(dataObject.state).to.deep.equal(newState);
            expect(dataObject.stateWatcher.next.callCount).to.be.equal(0);
        });
    });

    describe('applySamples', () => {
        const fireSampleSetSpy = sinon.spy();

        before(() => {
            mod.default.__Rewire__('fireSampleSet', fireSampleSetSpy);
        });

        after(() => {
            mod.default.__ResetDependency__('fireSampleSet');
        });

        beforeEach(() => {
            fireSampleSetSpy.reset();
        });

        it('should works without sampleMapping', () => {
            const hokku = {
                data: {
                    sampleMapping: null
                }
            };
            const action = {type: 'A'};

            mod.applySamples(hokku, action);

            expect(fireSampleSetSpy.callCount).to.be.equal(0);
        });
        it('should works without sample set', () => {
            const hokku = {
                data: {
                    sampleMapping: {
                        'A1': {type: 'B1'}
                    }
                }
            };
            const action = {type: 'A'};

            mod.applySamples(hokku, action);
            expect(fireSampleSetSpy.callCount).to.be.equal(0);
        });
        it('should works with defined sample set', () => {
            const hokku = {
                data: {
                    sampleMapping: {
                        'A1': {type: 'B1'}
                    }
                }
            };
            const action = {type: 'A1'};

            mod.applySamples(hokku, action);
            expect(fireSampleSetSpy.callCount).to.be.equal(1);
        })
    });

    describe('applyPlugins', () => {
        it('should pass action into all plugins', () => {
            const hook1Spy = sinon.spy();
            const hook2Spy = sinon.spy();
            const fakeHokku = {
                data: {
                    plugins: [
                        {hook: hook1Spy},
                        {hook: hook2Spy}
                    ]
                }
            };
            const action = {type: 'A1'};

            mod.applyPlugins(fakeHokku, action);

            expect(hook1Spy.callCount).to.be.equal(1);
            expect(hook1Spy.getCall(0).args[0]).to.deep.equal(action);
            expect(hook2Spy.callCount).to.be.equal(1);
            expect(hook2Spy.getCall(0).args[0]).to.deep.equal(action);
        });

        it('should skip if plugins if not defined', () => {
            const fakeHokku = {
                data: {
                    plugins: null
                }
            };
            const action = {type: 'A1'};

            mod.applyPlugins(fakeHokku, action);
        })
    });

    describe('pluginInitializarion', () => {
        const isListStub = sinon.stub();
        const opts = Math.random();

        before(() => {
            mod.default.__Rewire__('isList', isListStub);
        });

        after(() => {
            mod.default.__ResetDependency__('isList');
        });

        beforeEach(() => {
            isListStub.reset();
        });

        it('should return options and skip plugins if it is not set', () => {
            isListStub.callsFake(() => false);
            const fakeHokku = {};
            const res = mod.pluginInitializarion(fakeHokku, opts, undefined);

            expect(res).to.be.a('promise');
            return res
                .then(_opts => {
                    expect(_opts).to.deep.equal(opts)
                })
        });

        it('should initialized plugin list', () => {
            isListStub.callsFake(() => true);
            const fakeHokku = {
                data: {
                    plugins: null
                }
            };
            const plugins = [
                sinon.stub().callsFake(() => Promise.resolve(1)),
                sinon.stub().callsFake(() => Promise.resolve(2))
            ];
            const res = mod.pluginInitializarion(fakeHokku, opts, plugins);

            expect(res).to.be.a('promise');
            return res
                .then(_opts => {
                    expect(_opts).to.deep.equal(opts);
                    expect(fakeHokku.data.plugins).to.deep.equal([1, 2]);

                    expect(plugins[0].callCount).to.be.equal(1);
                    expect(plugins[1].callCount).to.be.equal(1);
                })
        });

        it('should return promise exception if initialization failed', () => {
            isListStub.callsFake(() => true);
            const fakeHokku = {
                data: {
                    plugins: null
                }
            };
            const plugins = [
                sinon.stub().callsFake(() => Promise.resolve(1)),
                sinon.stub().callsFake(() => Promise.reject())
            ];
            const res = mod.pluginInitializarion(fakeHokku, opts, plugins);

            expect(res).to.be.a('promise');
            return res
                .then(e => true)
                .catch(e => false)
                .then(isPass => {
                    expect(isPass).to.deep.equal(false);

                    expect(fakeHokku.data.plugins).to.be.null;

                    expect(plugins[0].callCount).to.be.equal(1);
                    expect(plugins[1].callCount).to.be.equal(1);
                })
        })
    });

    describe('fireSampleSet', () => {
        const fireSpy = sinon.spy();
        const selectSpy = sinon.spy();
        const fakeHokku = {
            fire: fireSpy,
            select: selectSpy
        };
        const payload = {
            test: 'data'
        };

        beforeEach(() => {
            fireSpy.reset();
            selectSpy.reset();
        });

        it('should works with undefined/null actionSet', () => {
            mod.fireSampleSet(fakeHokku, undefined, payload);
            mod.fireSampleSet(fakeHokku, null, payload);
            expect(fireSpy.callCount).to.be.equal(0);
        });

        it('should fail with unsuported actionSet type', () => {
            expect(
                () => mod.fireSampleSet(fakeHokku, 123, payload)
            ).to.throw('Unsupported handler type for sampleSet')
        });

        it('should works for one action in actionSet', () => {
            const action1 = {type: 'A1'};
            const actionSet = action1;

            mod.fireSampleSet(fakeHokku, actionSet, payload);
            expect(fireSpy.callCount).to.be.equal(1);
            expect(fireSpy.getCall(0).args[0]).to.deep.equal(action1);
        });

        it('should works for array actionSet', () => {
            const action1 = {type: 'A1'};
            const action2 = {type: 'A2'};
            const actionSet = [action1, action2];

            mod.fireSampleSet(fakeHokku, actionSet, payload);
            expect(fireSpy.callCount).to.be.equal(2);
            expect(fireSpy.getCall(0).args[0]).to.deep.equal(action1);
            expect(fireSpy.getCall(1).args[0]).to.deep.equal(action2);
        });

        it('should works for promise actionSet', (done) => {
            const action1 = {type: 'A1'};
            const actionSet = Promise.resolve(action1);

            mod.fireSampleSet(fakeHokku, actionSet, payload);

            setTimeout(() => {
                expect(fireSpy.callCount).to.be.equal(1);
                expect(fireSpy.getCall(0).args[0]).to.deep.equal(action1);
                done();
            }, 10)
        });

        it('should works for function actionSet', () => {
            const action1 = {type: 'A1'};
            const actionSet = () => action1;

            mod.fireSampleSet(fakeHokku, actionSet, payload);
            expect(fireSpy.callCount).to.be.equal(1);
            expect(selectSpy.callCount).to.be.equal(1);
            expect(fireSpy.getCall(0).args[0]).to.deep.equal(action1);
        });

        it('should works for complex actionSet', (done) => {
            const action1 = {type: 'A1'};
            const action2 = {type: 'A2'};
            const action3 = {type: 'A3'};
            const action4 = {type: 'A4'};
            const action5 = {type: 'A5'};
            const actionSet = () => {
                return [
                    action1,
                    () => action2,
                    action3,
                    [action4],
                    () => Promise.resolve(action5)
                ]
            };

            mod.fireSampleSet(fakeHokku, actionSet, payload);

            setTimeout(() => {
                expect(fireSpy.callCount).to.be.equal(5);
                expect(selectSpy.callCount).to.be.equal(3);

                expect(fireSpy.getCall(0).args[0]).to.deep.equal(action1);
                expect(fireSpy.getCall(1).args[0]).to.deep.equal(action2);
                expect(fireSpy.getCall(2).args[0]).to.deep.equal(action3);
                expect(fireSpy.getCall(3).args[0]).to.deep.equal(action4);
                expect(fireSpy.getCall(4).args[0]).to.deep.equal(action5);

                done();
            }, 10)
        });
    });

    describe('libInitialization', () => {
        const fakeHokku = {
            data: {
                lib: {}
            }
        }

        it('should pass if opts.lib is not defined', () => {
            const opts = {
                lib: undefined
            };

            const res = mod.libInitialization(fakeHokku, opts);

            expect(res).to.be.a('promise');

            return res
                .then(v => {
                    expect(v).to.deep.equal(opts);
                })
        });

        it('should fail with unsupported initialized type', () => {
            const opts = {
                lib: {
                    lib1: 123
                }
            };

            expect(
                () => mod.libInitialization(fakeHokku, opts)
            ).to.throw('Unsupported initializer type for lib1')
        });

        it('should pass with empty object initialized', () => {
            const opts = {
                lib: {}
            };

            const res = mod.libInitialization(fakeHokku, opts);

            expect(res).to.be.a('promise');

            return res
                .then(v => {
                    expect(v).to.deep.equal(opts);
                })
        });

        it('should works', () => {
            const opts = {
                lib: {
                    lib1: Promise.resolve(1),
                    lib2: Promise.resolve(2),
                    lib3: new Promise((res) => res(3))
                }
            };
            const libs = {
                lib1: 1,
                lib2: 2,
                lib3: 3
            };
            const res = mod.libInitialization(fakeHokku, opts);

            expect(res).to.be.a('promise');

            return res
                .then(v => {
                    expect(v).to.deep.equal(opts);
                    expect(fakeHokku.data.lib).to.deep.equal(libs);
                })
        });

        it('should fail if promise is failed', () => {
            const opts = {
                lib: {
                    lib1: Promise.resolve(1),
                    lib2: new Promise((res, rej) => rej())
                }
            };
            const res = mod.libInitialization(fakeHokku, opts);

            expect(res).to.be.a('promise');

            return res
                .then(() => true)
                .catch(err => false)
                .then(f => {
                    expect(f).to.be.false
                })
        });
    });

    describe('onReadyEvent', () => {
        const fakeHokku = {
            fire: sinon.stub().callsFake((arg) => Promise.resolve(arg))
        };
        const opts = {
            ready: sinon.spy()
        };
        const isFunctionStub = sinon.stub();

        before(() => {
            mod.default.__Rewire__('isFunction', isFunctionStub);
        });

        after(() => {
            mod.default.__ResetDependency__('isFunction');
        });

        beforeEach(() => {
            opts.ready.reset();
            fakeHokku.fire.resetHistory();
            isFunctionStub.reset();
        });

        it('should works if ready is not a function', () => {
            isFunctionStub.callsFake(() => false);

            const res = mod.onReadyEvent(fakeHokku, opts);

            expect(res).to.deep.equal(opts);
            expect(fakeHokku.fire.callCount).to.be.equal(1);
            expect(opts.ready.callCount).to.be.equal(0);
            expect(isFunctionStub.callCount).to.be.equal(1);
        });

        it('should works if ready is a function', () => {
            isFunctionStub.callsFake(() => true);

            const res = mod.onReadyEvent(fakeHokku, opts);

            expect(res).to.deep.equal(opts);
            expect(fakeHokku.fire.callCount).to.be.equal(1);
            expect(opts.ready.callCount).to.be.equal(1);
            expect(isFunctionStub.callCount).to.be.equal(1);
        })
    });

    describe('buildGlobalObjectKey', () => {
        const isString = sinon.stub();

        before(() => {
            mod.default.__Rewire__('isString', isString);
        });

        after(() => {
            mod.default.__ResetDependency__('isString');
        });

        beforeEach(() => {
            isString.reset();
        });

        it('should generate default name', () => {
            isString.callsFake(() => false);

            expect(
                mod.buildGlobalObjectName({})
            ).to.be.equal('default_hokku_application_default_hokku_service');
            expect(isString.callCount).to.be.equal(2)
        });

        it('should generate return selected name', () => {
            isString.callsFake(() => true);

            expect(
                mod.buildGlobalObjectName({app: 'xxx', service: 'yyy'})
            ).to.be.equal('xxx_yyy');
            expect(isString.callCount).to.be.equal(2)
        })
    });

    describe('getGlobalObject', () => {
        const gObject = {
            hokkuSysObjectMap: {'KEY_1': 'VALUE_1'}
        };
        const getPlatformGlobalObjectStub = sinon.stub();

        before(() => {
            mod.default.__Rewire__('getPlatformGlobalObject', getPlatformGlobalObjectStub);
        });

        after(() => {
            mod.default.__ResetDependency__('getPlatformGlobalObject');
        });

        beforeEach(() => {
            getPlatformGlobalObjectStub.reset();
        });

        it('should return null if SysObjectMap is not exists', () => {
            getPlatformGlobalObjectStub.callsFake(() => ({}));

            expect(
                mod.getGlobalObject('KEY_1')
            ).to.be.null;
            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1)
        });

        it('should return null if KEY is not exists', () => {
            getPlatformGlobalObjectStub.callsFake(() => gObject);

            expect(
                mod.getGlobalObject('KEY_2')
            ).to.be.null;
            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1)
        });

        it('should return stored value', () => {
            getPlatformGlobalObjectStub.callsFake(() => gObject);

            expect(
                mod.getGlobalObject('KEY_1')
            ).to.be.equal('VALUE_1');
            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1)
        });

        it('should return exception', () => {
            getPlatformGlobalObjectStub.callsFake(() => undefined);
            expect(
                () => mod.getGlobalObject('KEY_1')
            ).to.throw('Unsupported platform');
            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1)
        })
    });

    describe('setGlobalObject', () => {
        const getPlatformGlobalObjectStub = sinon.stub();
        const resObject = {
            hokkuSysObjectMap: {'KEY_X': 'VALUE_Y'}
        };

        before(() => {
            mod.default.__Rewire__('getPlatformGlobalObject', getPlatformGlobalObjectStub);
        });
        after(() => {
            mod.default.__ResetDependency__('getPlatformGlobalObject');
        });
        beforeEach(() => {
            getPlatformGlobalObjectStub.reset();
        });

        it('should works with empty global object', () => {
            const gObject = {};

            getPlatformGlobalObjectStub.callsFake(() => gObject);
            mod.setGlobalObject('KEY_X', 'VALUE_Y');

            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1);
            expect(gObject).to.deep.equal(resObject)
        });

        it('should works with empty global sys map', () => {
            const gObject = {
                hokkuSysObjectMap: {}
            };

            getPlatformGlobalObjectStub.callsFake(() => gObject);
            mod.setGlobalObject('KEY_X', 'VALUE_Y');

            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1);
            expect(gObject).to.deep.equal(resObject)
        });

        it('should override existing value', () => {
            const gObject = {
                hokkuSysObjectMap: {'KEY_X': 'VALUE_Y'}
            };

            getPlatformGlobalObjectStub.callsFake(() => gObject);
            mod.setGlobalObject('KEY_X', 'VALUE_Y');

            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1);
            expect(gObject).to.deep.equal(resObject)
        });

        it('should append new key/value', () => {
            const gObject = {
                hokkuSysObjectMap: {'KEY_1': 'VALUE_2'}
            };

            getPlatformGlobalObjectStub.callsFake(() => gObject);
            mod.setGlobalObject('KEY_X', 'VALUE_Y');

            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1);
            expect(gObject).to.deep.equal(
                Object.assign({}, resObject, {
                    hokkuSysObjectMap: Object.assign({}, resObject.hokkuSysObjectMap, {
                        'KEY_1': 'VALUE_2'
                    })
                })
            )
        })

        it('should return exception', () => {
            getPlatformGlobalObjectStub.callsFake(() => undefined);
            expect(
                () => mod.setGlobalObject('KEY_1', 'VALUE_1')
            ).to.throw('Unsupported platform');
            expect(getPlatformGlobalObjectStub.callCount).to.be.equal(1)
        })
    })
});
