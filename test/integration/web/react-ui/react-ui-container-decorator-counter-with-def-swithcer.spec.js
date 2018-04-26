import React from 'react';
import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-container-decorator-counter-with-def-swithcer', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'INC'});
                fire({type: 'INC'});
                fire({type: 'CHECK'});
            }
        });

        hook('CHECK', action => {
            document.querySelectorAll('#test_counter').should.exist;
            document.querySelector('#test_counter').should.have.text('2');

            done();
        });

        @Hokku.React.Root
        @Hokku.React.Container(
            {
                count: 0
            },
            Hokku.switcher({
                'INC': (payload, state) => ({count: state.count + 1})
            })
        )
        class Counter extends React.Component {
            render() {
                return (
                    <div>
                        <div id="test_counter">{this.props.count}</div>
                    </div>
                )
            }
        }
    })
});
