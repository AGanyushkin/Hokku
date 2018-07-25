import React, {Component} from 'react';
import Hokku, {ReactRoot, ReactContainer, Switcher} from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-container-decorator-with-def-switcher-selector', () => {

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
            document.querySelectorAll('#zz').should.exist;
            document.querySelector('#zz').should.have.text('4');

            document.querySelectorAll('#zx').should.exist;
            document.querySelector('#zx').should.have.text('5');

            document.querySelectorAll('#zc').should.exist;
            document.querySelector('#zc').should.have.text('6');

            done();
        });

        @ReactRoot
        @ReactContainer(
            {
                zz: 4,
                zx: 0,
                zc: 0
            },
            Switcher({
                'A_1': payload => ({zx: 5, zc: 6})
            }),
            state => ({zx: -5})
        )
        class ValueCheck extends Component {
            render() {
                return (
                    <div>
                        <div id="zz">{this.props.zz}</div>
                        <div id="zx">{this.props.zx}</div>
                        <div id="zc">{this.props.zc}</div>
                    </div>
                )
            }
        }
    })
});
