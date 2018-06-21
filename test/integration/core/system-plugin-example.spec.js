import chai from 'chai';
const expect = chai.expect;

import Hokku from '../../../lib/core/javascript/hokku'
import {injectPlugins} from '../../../lib/core/javascript/hokkuModuleBuilder';

describe('plugin', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('system plugin example', (done) => {

        function ExampleSysPlugin(hokku) {
            const plugin = {
                hook(action) {
                    if (action.type === 'ACTION_FROM_USER') {
                        return hokku.fireOnlyForCore(
                            {
                                type: 'ACTION_FROM_PLUGIN',
                                payload: action.payload + 1
                            }
                        )
                    }
                    return Promise.resolve(action);
                }
            };

            return Promise.resolve(plugin)
        }

        const NewHokku = injectPlugins(Hokku, [ExampleSysPlugin]);

        /** --- */

        const {act} = NewHokku();

        const a1 = act('ACTION_FROM_USER');

        const {hook, fire} = new NewHokku({
            ready() {
                fire(a1(987));
            }
        });

        hook('ACTION_FROM_PLUGIN', action => {
            expect(action.payload).to.be.equal(988);
            done();
        });

    })
});
