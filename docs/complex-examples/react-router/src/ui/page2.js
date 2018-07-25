import React from 'react';
import { Link } from 'react-router-dom';

class Page2 extends React.Component {
    render() {
        return (
            <div>
                <div>page2</div>
                <Link to='/'>Page 1</Link>
            </div>
        )
    }
}

export default Page2;
