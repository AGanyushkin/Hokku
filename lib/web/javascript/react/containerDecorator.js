// @flow
import React from 'react';
import type {
    HokkuType,
    ReactComponentType,
    ReactContainerStateMappingType,
    ReactContainerDecoratorWrapperType,
    ReactContainerDecoratorType,
    ReactPropsType,
    ReactStateType,
    ActionType,
    StateType,
    ReducerType, StateSelectorType
} from '../../../core/javascript/types/interface';
import {isFunction} from '../../../core/javascript/util';

function getArguments(args: []) { // todo, args it is not real array!
    let defState: StateType = null;
    let switcher: ReducerType = null;
    let stateFilter: ReactContainerStateMappingType = null;

    if (args.length === 1) {
        if (isFunction(args[0])) {
            stateFilter = args[0];
        } else {
            defState = args[0];
        }
    } else if (args.length === 2) {
        defState = args[0];
        switcher = args[1];
    } else if (args.length === 3) {
        defState = args[0];
        switcher = args[1];
        stateFilter = args[2];
    } else {
        throw new Error(`Incorrect decoratorHokkuUIReactContainer call arguments = ${JSON.stringify(arguments)}`);
    }

    return {defState, switcher, stateFilter}
}

function decoratorHokkuUIReactContainerFactory(Hokku: HokkuType): ReactContainerDecoratorWrapperType {
    return function decoratorHokkuUIReactContainer(): ReactContainerDecoratorType {
        let {defState, switcher, stateFilter} = getArguments(arguments);

        function buildContainerState(
            select: (StateSelectorType) => StateType,
            action: ActionType,
            componentState: {}) {

            let state = defState ? defState : {};

            if (stateFilter) {
                state = Object.assign(state, stateFilter(select()));
            }
            if (switcher && action) {
                // todo, 4th argument (select()) IS NOT in interface.
                const switchedState = switcher(
                    action.type,
                    action.payload,
                    componentState ? componentState : {},
                    select()
                );

                state = Object.assign(state, switchedState);
            }
            // todo, update flag for switcher. prevent ui update without switcher execution. ???
            return state;
        }

        return function _decoratorHokkuUIReactContainer(CLS: ReactComponentType): ReactComponentType {
            const {select, stateWatcher, hook, hookAll} = Hokku();

            const innerCLS: ReactComponentType = class extends React.Component {
                constructor(props: ReactPropsType) {
                    super(props);

                    this.state = buildContainerState(select, null, this.state);

                    hook(Hokku.ACTIONS.STARTUP, (action: ActionType) => {
                        this.setState((prevState: ReactStateType, props: ReactPropsType) => {
                            return buildContainerState(select, null, this.state);
                        })
                    });
                    if (switcher) {
                        hookAll().subscribe((action: ActionType): void => {
                            this.setState((prevState: ReactStateType, props: ReactPropsType) => {
                                return buildContainerState(select, action, this.state);
                            })
                        });
                    }
                    if (stateFilter) {
                        stateWatcher()
                            .subscribe((state: StateType) => {
                                this.setState((prevState: ReactStateType, props: ReactPropsType) => {
                                    return buildContainerState(select, null, this.state);
                                })
                            })
                    }
                }
                render() {
                    return <CLS {...this.props} {...this.state} />
                }
            };

            return innerCLS;
        }
    }
}

export default decoratorHokkuUIReactContainerFactory;
