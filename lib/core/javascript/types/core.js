// @flow
import type {
    PayloadType, StateType, ReducerType,
    SampleActionSetType, RxStreamType, PluginObjectType,
    WebSocketType, HokkuType
} from './interface';

export type HokkuApplicationAnyType = any; // eslint-disable-line flowtype/no-weak-types
export type HokkuApplicationCommonObjectType = any; // eslint-disable-line flowtype/no-weak-types
export type HokkuApplicationCommonCallbackType = any; // eslint-disable-line flowtype/no-weak-types

export type PayloadBuildType = (payload: PayloadType) => PayloadType;

export type PromiseResolveCallbackType = (data: ?HokkuApplicationAnyType) => void;
export type PromiseRejectCallbackType = (error: ?(Error | HokkuApplicationAnyType)) => void;

export type WaiterType = {
    ready: boolean,
    error: boolean,
    done: boolean,
    resolve: () => void,
    reject: () => void,
    catch: (Error) => void
};

export type KoaApplicationType = HokkuApplicationAnyType;
export type KoaQueryCtxType = HokkuApplicationAnyType;

export type HttpQueryType = {
    key: string,
    ctx: KoaQueryCtxType,
    payload: PayloadType,
    waiter: WaiterType
};

export type HttpType = {
    queryPool: Array<HttpQueryType>
};

export type ApplicationIdType = string | null;
export type ServiceIdType = string | null;
export type InstanceIdType = string | null;
export type ConnectionStateType = 'JUST_CONNECTED' | 'INITIALIZED' | 'LIVE' | 'DISCONNECTED';
export type ConnectionType = {
    socket: WebSocketType,
    socketOutput: WebSocketType,
    input: RxStreamType,
    output: RxStreamType,
    applicationid: ApplicationIdType,
    serviceid: ServiceIdType,
    instanceid: InstanceIdType,
    state: ConnectionStateType,
    type: 'WEB' | 'NODE',
    address: string,
    port: number,
    alternativeAddressList: Array<string>,
    owner: boolean
};
export type PipeProtocolClusterInfoType = HokkuApplicationAnyType;

export type DiscoveryEventType = {
    applicationid: ApplicationIdType,
    serviceid: ServiceIdType,
    instanceid: InstanceIdType,
    pipeAddress: string,
    pipePort: number
};

export type PipeType = {
    connections: Map<InstanceIdType, ConnectionType>,
    connSump: Set<ConnectionType>,
    stepEngineRunner: RxStreamType,
    discoverySubject: Rx.Subject<DiscoveryEventType>
};

export type UuidType = string;

export type ActionGateConnectionType = {
    id: UuidType,
    socket: WebSocketType,
    state: ConnectionStateType,
    input: RxStreamType,
    output: RxStreamType
};

export type ActionGateServerType = {
    connections: Map<string, ActionGateConnectionType>,
    clientStorage: Map<string, HokkuApplicationAnyType>,
    clientSessionStorage: Map<string, HokkuApplicationAnyType>
};

export type ActionGateClientType = {
    connection: ActionGateConnectionType
};

export type HokkuStorageEngineDataType = {
    conn: HokkuApplicationCommonObjectType,
    entityOptions: HokkuApplicationAnyType,
    fields: Map<string, string>
};

export type StorageEntityOptionsType = {
    conn: HokkuApplicationAnyType,
    fields: Map<string, string>,
    entityOptions: HokkuApplicationAnyType
};

export type StorageSearchQueryType = () => void;

export type StorageDriverType ={
    put(entity: HokkuApplicationAnyType, options: StorageEntityOptionsType): Promise<*>,
    pull(query: StorageSearchQueryType, options: StorageEntityOptionsType): Promise<*>,
    get(id: string, options: StorageEntityOptionsType): Promise<*>,
    update(id: string, values: HokkuApplicationAnyType, options: StorageEntityOptionsType): Promise<*>
};

export type StorageDriverFactoryType = (hokku: HokkuType) => Promise<StorageDriverType>;

export type CoreDataType = {
    instanceId: UuidType,
    actPoolMap: {[string]: RxStreamType}, // ?
    baseWatcher: HokkuApplicationAnyType,
    stateWatcher: RxStreamType,
    sampleMapping: {[string]: SampleActionSetType},
    state: StateType,
    reducer: ReducerType,
    lib: {[string]: Promise<*>},
    init: WaiterType,
    initialized: boolean,
    plugins: Array<PluginObjectType>,
    http: HttpType,
    pipe: PipeType,
    ui: {
        viewid: string
    },
    actionGate: ActionGateServerType | ActionGateClientType,
    storage: Promise<StorageDriverType>
};

export type CommonFetchResponseType = HokkuApplicationAnyType;

export type RinfoType = {
    address: string
};

export type SocketIoConnectionType = HokkuApplicationAnyType;

export type ActArgumentsType = {
    type: ?string,
    transform: ?PayloadBuildType
};

export type EntityTargetType = HokkuApplicationAnyType;
export type EntityTargetValueType = HokkuApplicationAnyType;
export type EntityTargetDescType = HokkuApplicationAnyType;
