import React from 'react';
import Hokku from 'hokku-web';

@Hokku.React.Container({test: 321})
class Helper extends React.Component {
    render() {
        return (
            <div style={{'paddingTop': '30px'}}>
                <b><i>helper text {this.props.test}: </i>{this.props.message}</b>
                {
                    this.props.children ?
                        <div><small>{this.props.children}</small></div> :
                        null
                }
            </div>
        )
    }
}

export default Helper;
