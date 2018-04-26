import React from 'react';
import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-container-decorator-with-def-switcher', () => {

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
            document.querySelectorAll('#q').should.exist;
            document.querySelector('#q').should.have.text('11');

            document.querySelectorAll('#w').should.exist;
            document.querySelector('#w').should.have.text('22');

            document.querySelectorAll('#e').should.exist;
            document.querySelector('#e').should.have.text('33');

            done();
        });

        @Hokku.React.Root
        @Hokku.React.Container(
            {
                q: 11,
                w: 22,
                e: 0
            },
            Hokku.switcher({
                'A_1': payload => ({e: 33})
            })
        )
        class ValueCheck extends React.Component {
            render() {
                return (
                    <div>
                        <div id="q">{this.props.q}</div>
                        <div id="w">{this.props.w}</div>
                        <div id="e">{this.props.e}</div>
                    </div>
                )
            }
        }
    })
});
