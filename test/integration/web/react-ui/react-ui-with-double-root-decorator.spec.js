import React, {Component} from 'react';
import Hokku, {ReactRoot} from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-with-double-root-decorator', () => {

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
            document.querySelectorAll('#xyz1').should.not.exist;

            document.querySelectorAll('#xyz2').should.exist;
            document.querySelector('#xyz2').should.have.text('check_2');

            done();
        });

        @ReactRoot
        class Welcome1 extends Component {
            render() {
                return <div id="xyz1">check_1</div>
            }
        }

        @ReactRoot
        class Welcome2 extends Component {
            render() {
                return <div id="xyz2">check_2</div>
            }
        }
    })
});
