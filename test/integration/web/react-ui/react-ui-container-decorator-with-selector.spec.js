import React, {Component} from 'react';
import Hokku, {ReactRoot, ReactContainer} from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-container-decorator-with-selector', () => {

    after(() => {
        (global || window).hokkuSysObjectMap = {}
    });

    it('should works', (done) => {

        const {hook, fire} = new Hokku({
            ready() {
                fire({type: 'A_1'});
            }
        });

        hook('A_1', action => {
            document.querySelectorAll('#x').should.exist;
            document.querySelector('#x').should.have.text('1');

            document.querySelectorAll('#y').should.exist;
            document.querySelector('#y').should.have.text('2');

            document.querySelectorAll('#z').should.exist;
            document.querySelector('#z').should.have.text('3');

            done();
        });

        @ReactRoot
        @ReactContainer(state => ({
            x: 1,
            y: 2,
            z: 3
        }))
        class ValueCheck extends Component {
            render() {
                return (
                    <div>
                        <div id="x">{this.props.x}</div>
                        <div id="y">{this.props.y}</div>
                        <div id="z">{this.props.z}</div>
                    </div>
                )
            }
        }
    })
});
