const koaRouter = require('koa-router');

const Tarantool = require('../tarantool');

function toResArray(result) {
    if (!result || result.length < 1) return [];
    return result[0].slice(1);
}

function useNotificationsApi(app) {

    const router = koaRouter({prefix: '/notifications'});
    app.use(router.routes());

    router.get('/:account', async (ctx, next) => {
        const account = ctx.params.account;
 
        if (!account) {
            ctx.body = [];
            return;
        }

        try {
            const res = await Tarantool.instance('tarantool').select('notifications', 0, 1, 0, 'eq', account);
            ctx.body = toResArray(res);
        } catch (error) {
            console.error(`[reqid ${ctx.request.header['x-request-id']}] ${ctx.method} ERRORLOG notifications @${account} ${error.message}`);
            ctx.body = [];
        }
    });

    router.get('/:account/:ids', async (ctx, next) => {
        const { account, ids } = ctx.params;
     
        if (!ids || !account) {
            ctx.body = [];
            return;
        }

        const fields = ids.split('-');
        try {
            let res = [];
            for (const id of fields) {
                res = await Tarantool.instance('tarantool').call('notification_read', account, id);
            }
            ctx.body = toResArray(res);
        } catch (error) {
            console.error(`[reqid ${ctx.request.header['x-request-id']}] ERRORLOG notifications @${account} ${error.message}`);
            ctx.body = [];
        }
    });
}

module.exports = { useNotificationsApi };
