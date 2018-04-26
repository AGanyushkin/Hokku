// @flow
import type {
    StorageDriverType,
    StorageEntityOptionsType,
    StorageSearchQueryType
} from '../../../../core/javascript/types/core';
import r from 'rethinkdb';
import type {
    HokkuType
} from '../../../../core/javascript/types/interface';

function initConnection(options: StorageEntityOptionsType, connectionOptions: any): Promise<*> {
    return new Promise((res, rej) => {
        r.connect(connectionOptions, (err: Error, conn: any): void => {
            if (err) rej(err);
            options.conn = conn;
            res();
        })
    })
}

function dbObjectFromEntity(fields: any, entity: any): any {
    const dbObject = {};

    for (let entityKey in fields) {
        const dbKey = fields[entityKey];

        dbObject[dbKey] = entity[entityKey];
    }

    return dbObject;
}

function entityFromDBObject(fields: any, dbObject: any): any {
    const entity = {};

    for (let entityKey in fields) {
        const dbKey = fields[entityKey];

        entity[entityKey] = dbObject[dbKey];
    }

    return entity;
}

export default function rethinkDBDriverFactory(hokku: HokkuType): Promise<StorageDriverType> {

    const driverAPI = {
        put(entity: any, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();
            const dataObject = dbObjectFromEntity(options.fields, entity);

            return act
                .then(() => new Promise((res, rej) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .insert([dataObject])
                        .run(options.conn, (err: Error, result) => {
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
                .then(() => new Promise((res, rej) => {
                    let query = r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table);

                    query = (filterFactory && filterFactory(query, r)) || query;
                    query.run(options.conn, (err: Error, cursor) => {
                        if (err) rej(err);

                        cursor.toArray((err: Error, result) => {
                            if (err) rej(err);
                            res(result.map(dbObj => entityFromDBObject(options.fields, dbObj)));
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
                .then(() => new Promise((res, rej) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .get(id)
                        .run(options.conn, (err: Error, result) => {
                            if (err) rej(err);
                            res(entityFromDBObject(options.fields, result));
                        })
                }))
        },
        update(id: string, values: any, options: StorageEntityOptionsType): Promise<*> {
            const connectionOptions = Object.assign(
                {},
                hokku.opts.storage,
                options.entityOptions || {}
            );
            const act = !options.conn ? initConnection(options, connectionOptions) : Promise.resolve();

            return act
                .then(() => new Promise((res, rej) => {
                    r
                        .db(connectionOptions.db)
                        .table(connectionOptions.table)
                        .filter(r.row('id').eq(id))
                        .update(values)
                        .run(options.conn, (err: Error, result) => {
                            if (err) rej(err);
                            // todo, test if update is ok, without any errors
                            res(result);
                        })
                }))
        }
    };

    return new Promise((res: (StorageDriverType) => void, rej: (Error) => void) => {
        res(driverAPI)
    })
};
