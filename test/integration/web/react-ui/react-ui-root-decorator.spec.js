import React from 'react';
import Hokku from '../../../../lib/web/javascript/hokku';
import chai from 'chai';
import chaiDom from 'chai-dom';
chai.use(chaiDom);
chai.should();

describe('react-ui-root-decorator', () => {

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
            document.querySelectorAll('#xyz').should.exist;
            document.querySelector('#xyz').should.have.text('hi!');
            done();
        });

        @Hokku.React.Root
        class Welcome extends React.Component {
            render() {
                return <div id="xyz">hi!</div>
            }
        }
    })
});
