import React, {Component} from 'react';
import Hokku, {ReactRoot, ReactContainer} from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-container-decorator-with-def-selector', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
                fire({type: 'A_2'});
            }
        });

        hook('A_2', action => {
            document.querySelectorAll('#h').should.exist;
            document.querySelector('#h').should.have.text('44');

            document.querySelectorAll('#g').should.exist;
            document.querySelector('#g').should.have.text('55');

            document.querySelectorAll('#f').should.exist;
            document.querySelector('#f').should.have.text('66');

            done();
        });

        @ReactRoot
        @ReactContainer(
            {
                h: 44,
                g: 0,
                f: 0
            },
            null,
            state => ({g: 55, f: 66})
        )
        class ValueCheck extends Component {
            render() {
                return (
                    <div>
                        <div id="h">{this.props.h}</div>
                        <div id="g">{this.props.g}</div>
                        <div id="f">{this.props.f}</div>
                    </div>
                )
            }
        }
    })
});
