// @flow
import type {
    HokkuType,
    PluginObjectType,
    ActionType,
    PayloadType
} from '../../../core/javascript/types/interface';
import type {
    KoaQueryCtxType,
    KoaApplicationType,
    HokkuApplicationCommonCallbackType
} from '../../../core/javascript/types/core';
import Koa from 'koa';
import KoaCors from 'koa2-cors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import uuid from 'uuid/v4';
import Waiter from '../../../core/javascript/waiter';

function initStaticServer(hokku: HokkuType, koaApp: KoaApplicationType): void {
    if (hokku.opts.http.static) {
        const opts = {};

        if (hokku.opts.http.staticIndex) {
            opts['index'] = hokku.opts.http.staticIndex;
        }
        koaApp.use(
            serve(hokku.opts.http.static, opts)
        )
    }
}

function HttpQuery(key: string, ctx: KoaQueryCtxType, payload: PayloadType) {
    this.key = key;
    this.ctx = ctx;
    this.payload = payload;
    this.waiter = new Waiter();
}

function buildRequestAction(key: string, payload: PayloadType, hokku: HokkuType): ActionType {
    const action = Object.create({
        ok(respPayload: PayloadType): ActionType {
            hokku.fire(this.okAction(respPayload));
        },
        okAction(respPayload: PayloadType): ActionType {
            return {
                type: 'HTTP:RESPONSE',
                key: this.key,
                payload: respPayload
            }
        },
        failAction() {
            return {
                type: 'HTTP:RESPONSE',
                key: this.key,
                fail: true
            }
        },
        fail() {
            hokku.fire(this.failAction());
        },
        responseAction(status: number, payload: PayloadType) {
            return {
                type: 'HTTP:RESPONSE',
                key: this.key,
                status,
                payload
            }
        },
        response(status: number, payload: PayloadType) {
            hokku.fire(this.responseAction(status, payload));
        }
    });

    action.type = `HTTP:${payload.method}:${payload.path.substr(4)}`;
    action.payload = payload;
    action.key = key;

    return action;
}

function actionProxyFactory(hokku: HokkuType) {
    async function actionProxy(ctx: KoaQueryCtxType, next: HokkuApplicationCommonCallbackType): void {
        if (ctx.path.indexOf('/api/') === 0) {
            const key = uuid();
            const payload = {
                method: ctx.request.method,
                path: ctx.path,
                url: ctx.url,
                request: ctx.request,
                query: ctx.query,
                params: ctx.params,
                body: ctx.request.body
            };

            hokku.data.http.queryPool[key] = new HttpQuery(key, ctx, payload);
            hokku.fireOnlyForCore(buildRequestAction(key, payload, hokku));

            try {
                const res = await hokku.data.http.queryPool[key].waiter;

                ctx.status = res.status;
                ctx.body = res.payload;
            } catch (err) {
                ctx.throw(500, err);
            }
            delete hokku.data.http.queryPool[key];
        } else {
            await next();
        }
    }

    return actionProxy;
}

function initHttpServer(hokku: HokkuType): void {
    const DEFAULT_HTTP_PORT = 80;

    const port = +hokku.opts.http.port;
    const koaApp = new Koa();

    koaApp.use(bodyParser());
    koaApp.use(KoaCors(
        hokku.opts.http.cors
    ));
    koaApp.use(actionProxyFactory(hokku));

    // app.on('error', (err, ctx) => {
    //     log.error('server error', err, ctx)
    // });

    initStaticServer(hokku, koaApp);

    koaApp.listen(isNaN(port) ? DEFAULT_HTTP_PORT : port);
}

export default (hokku: HokkuType): Promise<PluginObjectType> => new Promise((res: () => void, rej: () => void) => {
    if (hokku.opts.http) {
        hokku.data.http = hokku.data.http || {};
        hokku.data.http.queryPool = {};

        initHttpServer(hokku);

        const plugin = {
            hook(action: ActionType): Promise<ActionType> {

                if (action.type === 'HTTP:RESPONSE') {
                    if (hokku.data.http.queryPool.hasOwnProperty(action.key)) {
                        if (action.fail) {
                            hokku.data.http.queryPool[action.key].waiter.reject();
                            delete hokku.data.http.queryPool[action.key];
                        } else {
                            hokku.data.http.queryPool[action.key].waiter.resolve({
                                status: action.status || 200,
                                payload: action.payload || ''
                            })
                        }
                    }
                }

                return Promise.resolve(action);
            }
        };

        res(plugin);
    } else {
        res(null);
    }
})
