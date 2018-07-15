// @flow
import type {
    StorageDriverType,
    StorageEntityOptionsType,
    StorageSearchQueryType,
    PromiseRejectCallbackType,
    PromiseResolveCallbackType, HokkuApplicationAnyType
} from '../../../../core/javascript/types/core';
import type {
    HokkuType
} from '../../../../core/javascript/types/interface';
import type {
    QueryResultType,
    RdbConnectionOptionType,
    RdbConnectionType,
    RdbCursorType,
    RdbDatabaseObjectType
} from './rethinkDBDriverTypes';
import r from 'rethinkdb';

function initConnection(options: StorageEntityOptionsType, connectionOptions: RdbConnectionOptionType): Promise<*> {
    return new Promise((res: PromiseResolveCallbackType, rej: PromiseRejectCallbackType) => {
        r.connect(connectionOptions, (err: Error, conn: RdbConnectionType): void => {
            if (err) rej(err);
            options.conn = conn;
            res();
        })
    })
}

function dbObjectFromEntity(
    fields: HokkuApplicationAnyType,
    entity: HokkuApplicationAnyType
): HokkuApplicationAnyType {
    const dbObject = {};

    for (let entityKey in fields) {
        const dbKey = fields[entityKey];

        dbObject[dbKey] = entity[entityKey];
    }

    return dbObject;
}

function entityFromDBObject(
    fields: HokkuApplicationAnyType,
    dbObject: RdbDatabaseObjectType
): HokkuApplicationAnyType {
    const entity = {};

    for (let entityKey in fields) {
        const dbKey = fields[entityKey];

        entity[entityKey] = dbObject[dbKey];
    }

    return entity;
}

export default function rethinkDBDriverFactory(hokku: HokkuType): Promise<StorageDriverType> {

    const driverAPI = {
        put(entity: HokkuApplicationAnyType, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();
            const dataObject = dbObjectFromEntity(options.fields, entity);

            return act
                .then(() => new Promise((res: PromiseResolveCallbackType, rej: PromiseRejectCallbackType) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .insert([dataObject])
                        .run(options.conn, (err: Error, result: QueryResultType) => {
                            if (err) rej(err);
                            res(result);
                        })
                }));
        },
        pull(filterFactory: StorageSearchQueryType, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();

            return act
                .then(() => new Promise((res: PromiseResolveCallbackType, rej: PromiseRejectCallbackType) => {
                    let query = r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table);

                    query = (filterFactory && filterFactory(query, r)) || query;
                    query.run(options.conn, (err: Error, cursor: RdbCursorType) => {
                        if (err) rej(err);

                        cursor.toArray((err: Error, result: QueryResultType) => {
                            if (err) rej(err);
                            res(
                                result.map((dbObj: RdbDatabaseObjectType) => entityFromDBObject(options.fields, dbObj))
                            );
                        })

                    })
                }))
        },
        get(id: string, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();

            return act
                .then(() => new Promise((res: PromiseResolveCallbackType, rej: PromiseRejectCallbackType) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .get(id)
                        .run(options.conn, (err: Error, result: QueryResultType) => {
                            if (err) rej(err);
                            res(entityFromDBObject(options.fields, result));
                        })
                }))
        },
        update(id: string, values: HokkuApplicationAnyType, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();

            return act
                .then(() => new Promise((res: PromiseResolveCallbackType, rej: PromiseRejectCallbackType) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .filter(r.row('id').eq(id))
                        .update(values)
                        .run(options.conn, (err: Error, result: QueryResultType) => {
                            if (err) rej(err);
                            // todo, test if update is ok, without any errors
                            res(result);
                        })
                }))
        }
    };

    return new Promise((res: (StorageDriverType) => void) => {
        res(driverAPI)
    })
};
