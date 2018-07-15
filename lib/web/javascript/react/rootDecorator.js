// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid/v4';
import type {
    ActionType,
    HokkuType,
    ReactComponentType,
    ReactRootDecoratorType
} from '../../../core/javascript/types/interface';
import {withRouter} from 'react-router-dom';
import type {ReactClassType} from '../../types/core';
import {ReactPropsType} from '../../types/core';

function decoratorHokkuUIReactRootFactory(Hokku: HokkuType): ReactRootDecoratorType {
    return function decoratorHokkuUIReactRoot(CLS: ReactComponentType): void {
        const hokku = Hokku();

        class InternalReactRouterGlue extends React.Component {
            constructor(props: ReactPropsType) {
                super(props);
                hokku.hook('ROUTE', (action: ActionType) => {
                    const parts = action.type.split(':');

                    if (parts.length === 2) {
                        props.history.push(parts[1] || '/')
                    }
                })
            }
            render() {
                return <CLS />
            }
        }

        // eslint-disable-next-line no-unused-vars
        const InnerCLS: ReactClassType = withRouter(InternalReactRouterGlue);

        hokku.data.ui = hokku.data.ui || {};
        hokku.data.ui.viewid = hokku.data.ui.viewid || `hokku-react-view-container-${uuid()}`;

        const body = document.getElementsByTagName('body')[0];
        let root = document.getElementById(hokku.data.ui.viewid);

        if (!body) throw new Error('Undefined body tag in html document');
        if (!root) {
            const div = document.createElement('div');

            div.id = hokku.data.ui.viewid;
            body.appendChild(div);
            root = document.getElementById(hokku.data.ui.viewid);
        }

        ReactDOM.render(
            <BrowserRouter>
                <InnerCLS />
            </BrowserRouter>,
            root
        );
    }
}

export default decoratorHokkuUIReactRootFactory;
