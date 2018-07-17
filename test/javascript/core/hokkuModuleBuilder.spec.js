import chai from 'chai';
const expect = chai.expect;

import Rx from 'rxjs/Rx'
import sinon from 'sinon'

import * as mod from '../../../lib/core/javascript/hokkuModuleBuilder';

describe('hokkuModuleBuilder', () => {
    describe('createHokkuCoreDataObject', () => {
        const d = mod.createHokkuCoreDataObject();

        const valueCheck = {
            baseWatcher: null,
            initialized: false,
            reducer: null,
            sampleMapping: null,
            state: null
        };

        const typeCheck = {
            instanceId: '[object String]'
        };

        const instanceCheck = {
            actPoolMap: Object,
            init: Promise,
            lib: Object,
            stateWatcher: Rx.Subject
        };

        for (let key in valueCheck) {
            if (valueCheck.hasOwnProperty(key)) {
                it(`data.${key} should equal to ${valueCheck[key]}`, () => {
                    expect(d[key]).to.equal(valueCheck[key]);
                })
            }
        }

        for (let key in instanceCheck) {
            if (instanceCheck.hasOwnProperty(key)) {
                it(`data.${key} should be an instanse of ${instanceCheck[key]}`, () => {
                    expect(d[key]).to.be.an.instanceof(instanceCheck[key]);
                })
            }
        }

        for (let key in typeCheck) {
            if (typeCheck.hasOwnProperty(key)) {
                it(`data.${key} should be an type of ${typeCheck[key]}`, () => {
                    expect(
                        Object.prototype.toString.call(d[key])
                    ).to.be.equal(
                        typeCheck[key]
                    )
                })
            }
        }

        for (let key in d) {
            if (d.hasOwnProperty(key)) {
                it(`check if tested for key "${key}"`, () => {
                    expect(
                        valueCheck.hasOwnProperty(key) ||
                        instanceCheck.hasOwnProperty(key) ||
                        typeCheck.hasOwnProperty(key)
                    ).to.be.true
                })
            }
        }
    });

    describe('createNewHokkuInstance', () => {
        const rng = Math.random();

        before(() => {
            mod.default.__Rewire__('createHokkuCoreDataObject', () => rng);
            mod.default.__Rewire__('HokkuPrototype', {
                testMethod() {
                    return this.data;
                }
            });
        });

        after(() => {
            mod.default.__ResetDependency__('createHokkuCoreDataObject');
            mod.default.__ResetDependency__('HokkuPrototype');
        });

        it('should make valid new instance', () => {
            const k = mod.createNewHokkuInstance();

            expect(k.data).to.equal(rng);
            expect(k.testMethod).to.be.an.instanceof(Function);
            expect(k.testMethod()).to.equal(rng);

            const func = k.testMethod;

            expect(func()).to.equal(rng);
        })
    });

    describe('Hokku Constructor', () => {
        const selfObject = {
            data: {
                initialized: false,
                init: {
                    resolve: sinon.spy(),
                    reject: sinon.spy(),
                    catch: sinon.spy()
                }
            },
            setState: sinon.spy(),
            setReducer: sinon.spy()
        };
        const OPTS_EXISTING_INSTANCE = Math.random().toString();
        const OPTS_NEW_INSTANCE = Math.random().toString();
        const NEW_INSTANCE_ID = Math.random().toString();
        const EXISTING_INSTANCE_ID = Math.random().toString();

        const buildGlobalObjectName = sinon.stub();
        const getGlobalObject = sinon.stub();
        const buildOpts = sinon.stub();
        const libInitialization = sinon.stub();
        const pluginInitializarion = sinon.stub();
        const onReadyEvent = sinon.stub();
        const newHokkuStub = sinon.stub();

        buildGlobalObjectName.withArgs(OPTS_EXISTING_INSTANCE).returns(EXISTING_INSTANCE_ID);
        buildGlobalObjectName.withArgs(OPTS_NEW_INSTANCE).returns(NEW_INSTANCE_ID);
        getGlobalObject.withArgs(EXISTING_INSTANCE_ID).returns(selfObject);
        getGlobalObject.withArgs(NEW_INSTANCE_ID).returns(null);
        buildOpts.callsFake(opts => opts === OPTS_NEW_INSTANCE ? Promise.resolve(opts) : Promise.reject());
        libInitialization.returnsArg(1);
        pluginInitializarion.returnsArg(1);
        onReadyEvent.returnsArg(1);
        newHokkuStub.returns(selfObject);

        const cObject = {
            buildGlobalObjectName,
            getGlobalObject,
            buildOpts,
            libInitialization,
            pluginInitializarion,
            onReadyEvent,
            setGlobalObject: sinon.stub()
        };

        before(() => {
            mod.default.__Rewire__('createNewHokkuInstance', newHokkuStub);
            mod.default.__Rewire__('c', cObject);
        });
        beforeEach(() => {
            selfObject.data.initialized = false;
            selfObject.data.init.resolve.reset();
            selfObject.data.init.reject.reset();
            selfObject.setState.reset();
            selfObject.setReducer.reset();
            newHokkuStub.resetHistory();
            for (let key in cObject) {
                if (cObject.hasOwnProperty(key)) {
                    cObject[key].resetHistory();
                }
            }
        });
        after(() => {
            mod.default.__ResetDependency__('createNewHokkuInstance');
            mod.default.__ResetDependency__('c');
        });

        it('should works as a constructor', (done) => {
            const hokku = new mod.Hokku(OPTS_NEW_INSTANCE);

            setTimeout(() => {
                expect(cObject.buildGlobalObjectName.callCount).to.equal(1);
                expect(cObject.buildGlobalObjectName.getCall(0).args[0]).to.equal(OPTS_NEW_INSTANCE);
                expect(cObject.getGlobalObject.callCount).to.equal(1);
                expect(newHokkuStub.callCount).to.equal(1);

                expect(cObject.buildOpts.callCount).to.equal(1);
                expect(selfObject.setState.callCount).to.equal(0);
                expect(selfObject.setReducer.callCount).to.equal(0);
                expect(cObject.libInitialization.callCount).to.equal(1);
                expect(cObject.pluginInitializarion.callCount).to.equal(1);
                expect(cObject.onReadyEvent.callCount).to.equal(1);
                expect(selfObject.data.init.resolve.callCount).to.equal(1);
                expect(selfObject.data.init.reject.callCount).to.equal(0);

                expect(cObject.onReadyEvent.calledAfter(cObject.libInitialization)).to.be.true;
                expect(cObject.onReadyEvent.calledAfter(cObject.pluginInitializarion)).to.be.true;
                expect(selfObject.data.init.resolve.calledAfter(cObject.onReadyEvent)).to.be.true;

                expect(selfObject.data.initialized).to.be.true;

                expect(cObject.setGlobalObject.callCount).to.equal(1);
                expect(cObject.setGlobalObject.getCall(0).args[0]).to.equal(NEW_INSTANCE_ID);
                expect(cObject.setGlobalObject.getCall(0).args[1]).to.equal(selfObject);

                expect(hokku).to.equal(selfObject);

                done();
            }, 0)
        });

        it('should works as a constructor and catch initialization errors', (done) => {
            const hokku = new mod.Hokku(OPTS_EXISTING_INSTANCE);

            setTimeout(() => {
                expect(cObject.buildGlobalObjectName.callCount).to.equal(1);
                expect(cObject.buildGlobalObjectName.getCall(0).args[0]).to.equal(OPTS_EXISTING_INSTANCE);
                expect(cObject.getGlobalObject.callCount).to.equal(1);
                expect(newHokkuStub.callCount).to.equal(0);

                expect(cObject.buildOpts.callCount).to.equal(1);
                expect(selfObject.setState.callCount).to.equal(0);
                expect(selfObject.setReducer.callCount).to.equal(0);
                expect(cObject.libInitialization.callCount).to.equal(0);
                expect(cObject.pluginInitializarion.callCount).to.equal(0);
                expect(cObject.onReadyEvent.callCount).to.equal(0);
                expect(selfObject.data.init.resolve.callCount).to.equal(0);
                expect(selfObject.data.init.reject.callCount).to.equal(1);

                expect(selfObject.data.initialized).to.be.true;

                expect(cObject.setGlobalObject.callCount).to.equal(1);
                expect(cObject.setGlobalObject.getCall(0).args[0]).to.equal(EXISTING_INSTANCE_ID);
                expect(cObject.setGlobalObject.getCall(0).args[1]).to.equal(selfObject);

                expect(hokku).to.equal(selfObject);

                done();
            }, 0)
        });

        it('constructor should fail if instance already initialized', () => {
            selfObject.data.initialized = true;

            expect(() => new mod.Hokku(OPTS_NEW_INSTANCE)).to.throw();

            expect(cObject.buildGlobalObjectName.callCount).to.equal(1);
            expect(cObject.buildGlobalObjectName.getCall(0).args[0]).to.equal(OPTS_NEW_INSTANCE);
            expect(cObject.getGlobalObject.callCount).to.equal(1);
            expect(newHokkuStub.callCount).to.equal(1);

            expect(cObject.buildOpts.callCount).to.equal(0);
            expect(selfObject.setState.callCount).to.equal(0);
            expect(selfObject.setReducer.callCount).to.equal(0);
            expect(cObject.libInitialization.callCount).to.equal(0);
            expect(cObject.pluginInitializarion.callCount).to.equal(0);
            expect(cObject.onReadyEvent.callCount).to.equal(0);
            expect(selfObject.data.init.resolve.callCount).to.equal(0);
            expect(selfObject.data.init.reject.callCount).to.equal(0);

            expect(selfObject.data.initialized).to.be.true;

            expect(cObject.setGlobalObject.callCount).to.equal(0);
        });

        it('module getter should create new instance', () => {
            const hokku = mod.Hokku(OPTS_NEW_INSTANCE);

            expect(cObject.buildGlobalObjectName.callCount).to.equal(1);
            expect(cObject.buildGlobalObjectName.getCall(0).args[0]).to.equal(OPTS_NEW_INSTANCE);
            expect(cObject.getGlobalObject.callCount).to.equal(1);
            expect(newHokkuStub.callCount).to.equal(1);

            expect(cObject.buildOpts.callCount).to.equal(0);
            expect(selfObject.setState.callCount).to.equal(0);
            expect(selfObject.setReducer.callCount).to.equal(0);
            expect(cObject.libInitialization.callCount).to.equal(0);
            expect(cObject.pluginInitializarion.callCount).to.equal(0);
            expect(cObject.onReadyEvent.callCount).to.equal(0);
            expect(selfObject.data.init.resolve.callCount).to.equal(0);
            expect(selfObject.data.init.reject.callCount).to.equal(0);

            expect(selfObject.data.initialized).to.be.false;

            expect(cObject.setGlobalObject.callCount).to.equal(1);
            expect(cObject.setGlobalObject.getCall(0).args[0]).to.equal(NEW_INSTANCE_ID);
            expect(cObject.setGlobalObject.getCall(0).args[1]).to.equal(selfObject);

            expect(hokku).to.equal(selfObject);
        });

        it('module getter should pickup instance for key if it is already exists', () => {
            const hokku = mod.Hokku(OPTS_EXISTING_INSTANCE);

            expect(cObject.buildGlobalObjectName.callCount).to.equal(1);
            expect(cObject.buildGlobalObjectName.getCall(0).args[0]).to.equal(OPTS_EXISTING_INSTANCE);
            expect(cObject.getGlobalObject.callCount).to.equal(1);
            expect(newHokkuStub.callCount).to.equal(0);

            expect(cObject.buildOpts.callCount).to.equal(0);
            expect(selfObject.setState.callCount).to.equal(0);
            expect(selfObject.setReducer.callCount).to.equal(0);
            expect(cObject.libInitialization.callCount).to.equal(0);
            expect(cObject.pluginInitializarion.callCount).to.equal(0);
            expect(cObject.onReadyEvent.callCount).to.equal(0);
            expect(selfObject.data.init.resolve.callCount).to.equal(0);
            expect(selfObject.data.init.reject.callCount).to.equal(0);

            expect(selfObject.data.initialized).to.be.false;

            expect(cObject.setGlobalObject.callCount).to.equal(1);
            expect(cObject.setGlobalObject.getCall(0).args[0]).to.equal(EXISTING_INSTANCE_ID);
            expect(cObject.setGlobalObject.getCall(0).args[1]).to.equal(selfObject);

            expect(hokku).to.equal(selfObject);
        });
    });

    describe('injectStatic', () => {
        const ACTIONS_PH = Math.random();

        before(() => {
            mod.default.__Rewire__('ACTIONS', ACTIONS_PH);
            mod.default.__Rewire__('HokkuPrototype', {protoCheck: () => null});
            mod.default.__Rewire__('kStatic', {
            });
        });

        after(() => {
            mod.default.__ResetDependency__('ACTIONS');
            mod.default.__ResetDependency__('HokkuPrototype');
            mod.default.__ResetDependency__('kStatic');
        });

        it('should inject static methods and constants', () => {
            let testObject = {};

            testObject = mod.injectStatic(testObject);

            expect(testObject.ACTIONS).to.equal(ACTIONS_PH);
            expect(testObject.prototype.protoCheck).to.be.instanceof(Function);
        })
    });

    describe('injectPlugins', () => {
        it('should inject field with list of not initialized plugins', () => {
            let testObject = {};
            const fakePluginList = Math.random();

            testObject = mod.injectPlugins(testObject, fakePluginList);

            expect(testObject.__hokkuSystemPluginList__).to.be.equal(fakePluginList);
        })
    })
});
