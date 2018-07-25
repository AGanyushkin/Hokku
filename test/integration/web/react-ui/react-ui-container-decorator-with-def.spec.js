import React, {Component} from 'react';
import Hokku, {ReactRoot, ReactContainer} from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

/**
 * 123898 jhgkdfjhg
 * dfjgl jsd;fg
 * sdfgkl; j
 */
describe('react-ui-container-decorator-with-def', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });


    /**
     * test
     * message
     */
    it('should works', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
            }
        });

        hook('A_1', action => {
            document.querySelectorAll('#a').should.exist;
            document.querySelector('#a').should.have.text('7');

            document.querySelectorAll('#b').should.exist;
            document.querySelector('#b').should.have.text('8');

            document.querySelectorAll('#c').should.exist;
            document.querySelector('#c').should.have.text('9');

            done();
        });

        @ReactRoot
        @ReactContainer(
            {
                a: 7,
                b: 8,
                c: 9
            }
        )
        class ValueCheck extends Component {
            render() {
                return (
                    <div>
                        <div id="a">{this.props.a}</div>
                        <div id="b">{this.props.b}</div>
                        <div id="c">{this.props.c}</div>
                    </div>
                )
            }
        }
    })
});
