import React from 'react';
import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

// todo, refactoring for view id attributes. use random generated id values with uuid plugin.

describe('react-ui-container-decorator-with-switcher', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', (done) => {
        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
                setTimeout(() => fire({type: 'A_2'}), 1000);
            }
        });

        hook('A_2', action => {
            document.querySelectorAll('#test_switcher').should.exist;
            document.querySelector('#test_switcher').should.have.text('123');

            done();
        });

        @Hokku.React.Root
        @Hokku.React.Container(
            null,
            Hokku.switcher({
                'A_1': (payload, state) => {
                    return {switcher: 123}; // todo, fail if {switcher: true}, why?
                }
            })
        )
        class ValueCheck extends React.Component {
            render() {
                return (
                    <div>
                        <div id="test_switcher">{this.props.switcher}</div>
                    </div>
                )
            }
        }
    })
});
