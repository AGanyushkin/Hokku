import React from 'react';
import { Link } from 'react-router-dom';
import Hokku from 'hokku-web';
import {gotoPage2} from '../actions';

@Hokku.React.Container({
    gotoPage2
})
class Page1 extends React.Component {
    render() {
        return (
            <div>
                <div>page1</div>
                <Link to='/page2'>Page 2</Link>
                <br />
                <br />
                <div>
                    <button onClick={() => this.props.gotoPage2()}>goto Page 2</button>
                </div>
            </div>
        )
    }
}

export default Page1;
