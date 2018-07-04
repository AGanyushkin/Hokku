// @flow

// eslint-disable-next-line flowtype/no-weak-types
import {PayloadBuildType} from "./core";

export type PayloadType = any;

// eslint-disable-next-line flowtype/no-weak-types
export type RxStreamType = any;

// eslint-disable-next-line flowtype/no-weak-types
export type StateType = any;

export type StateSelectorType = () => StateType;

export type ActionType = {
    type: string,
    payload: PayloadType
};

export type ActionOptionsType = {
    visible: Map<string, string>,
    invisible: Map<string, string>,
    responseAction: ActionType,
    responseFunc: (action: ActionType) => Promise<ActionType>
};

export type CallbackType = () => void;
export type ErrorCallbackType = (error: Error) => void;

export type ActionCreatorType = (data: PayloadType, opts: ?ActionOptionsType) => ActionType;

export type ReducerType = (type: string, payload: PayloadType, state: StateType) => StateType;
export type ActionReducerType = (payload: PayloadType, state: StateType) => StateType;

// eslint-disable-next-line flowtype/no-weak-types
export type UnverifiedObjectType = any;

// eslint-disable-next-line flowtype/no-weak-types
export type GlobalObjectType = any;

export type HookType = string | Array<string>; // todo, interesting approach:    (action: ActionType) => boolean
export type HookCallbackType = (action: ActionType) => void;

// eslint-disable-next-line no-use-before-define
export type ReadyCallbackType = (hokku: HokkuType) => ?Promise<*>;

// eslint-disable-next-line flowtype/no-weak-types
export type LibraryEntityType = any;

// eslint-disable-next-line flowtype/no-weak-types
export type HttpCorsOptsType = any;

export type OptionsType = {
    app: string,
    service: string,
    debug: boolean,
    ready: ReadyCallbackType,
    reducer: ReducerType | null,
    state: StateType,
    lib: {[string]: Promise<*>},
    http: {
        port: number | boolean,
        static: string,
        staticIndex: string,
        cors: HttpCorsOptsType
    },
    pipe: {
        port: number | null,
        connectTo: {host: string, port: number} | null,
        prefix: string | null,
        discoveryBeacon: {
            port: number,
            ipVersion: number
        } | false,
        discovery: {
            port: number,
            ipVersion: number
        } | false,
        socketServer: {
            cfg: {
                path: string,
                serveClient: boolean,
                pingInterval: number,
                pingTimeout: number,
                cookie: boolean,
                transports: Array<string>
            }
        }
    },
    actionGate: {
        host: string,
        port: number,
        prefix: string,
        putActions: Array<string>,
        putSessionActions: Array<string>,
        socketServer: {
            cfg: {
                path: string,
                serveClient: boolean,
                pingInterval: number,
                pingTimeout: number,
                cookie: boolean,
                transports: Array<string>
            }
        },
        syncClientStorage: boolean
    },
    storage: {
        driver: 'rethinkdb' | StorageDriverType,
        driverOpts: Object,
        host: ?string,
        port: number,
        db: string,
        table: string
    }
};

// todo, lib: {[string]: Promise<*> | () => (Promise<*> | LibraryEntityType) | LibraryEntityType}

export type HokkuType = {
    data: CoreDataType,
    opts: OptionsType,

    fire(action: ActionType): Promise<ActionType>,
    fireOnlyForCore(action: ActionType): Promise<ActionType>,
    hook(type: HookType, cb: HookCallbackType): RxStreamType,
    hookAll(): RxStreamType,
    samples(): void,
    setState(state: StateType): void,
    setReducer(reduser: ReducerType): void,
    select(): StateType,
    act(theType: ?string, theTransform: ?PayloadBuildType): ActionCreatorType
};

export type HokkuConstructorType = (opts: OptionsType) => HokkuType;

export type SampleActionSetType = ActionType | Array<ActionType> |
    Promise<SampleActionSetType> | (HokkuType, PayloadType, StateSelectorType) => SampleActionSetType;

export type PluginObjectType = {
    hook(action: ActionType): Promise<ActionType>
};
export type PluginType = (hokku: HokkuType) => Promise<PluginObjectType>;
export type PluginsType = Array<PluginType>;

export type ActionSwitcherDescriptionType = Map<string, ActionReducerType>;

export type StateWatcherHandlerType = (state: StateType) => void;

// eslint-disable-next-line flowtype/no-weak-types
export type ReactComponentType = any;
// eslint-disable-next-line flowtype/no-weak-types
export type ReactContainerStateMappingType = (state: StateType) => Map<string, any>;
export type ReactContainerDecoratorType = (CLS: ReactComponentType) => ReactComponentType;
export type ReactContainerDecoratorWrapperType = (value: ReactContainerStateMappingType) => ReactContainerDecoratorType;
// eslint-disable-next-line flowtype/no-weak-types
export type ReactPropsType = Map<string, any>;
// eslint-disable-next-line flowtype/no-weak-types
export type ReactStateType = Map<string, any>;
export type ReactRootDecoratorType = (CLS: ReactComponentType) => void;

// eslint-disable-next-line flowtype/no-weak-types
export type WebSocketType = any;

export type PipeProtocolActionType = {
    type: string,
    payload: PayloadType
};

export type ActionGateProtocolActionType = {
    type: string,
    payload: PayloadType
};
