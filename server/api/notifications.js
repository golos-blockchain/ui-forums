const koaRouter = require('koa-router');

const Tarantool = require('../tarantool');

function toResArray(result) {
    if (!result || result.length < 1) return [];
    return result[0].slice(1);
}

function useNotificationsApi(app) {

    const router = koaRouter({prefix: '/notifications'});
    app.use(router.routes());

    router.get('/subscribe/:account/:subscriber_id?', async (ctx, next) => {
        let { account, subscriber_id } = ctx.params;
        if (!subscriber_id) {
            subscriber_id = Math.floor(Math.random() * 10000);
        }

        try {
            const res = await Tarantool.instance('tarantool').call('notification_subscribe', account, subscriber_id);
        } catch (error) {
            console.error(`[reqid ${ctx.request.header['x-request-id']}] ${ctx.method} ERRORLOG notifications @${account} ${error.message}`);
            ctx.body = { subscriber_id: null };
            return;
        }

        ctx.body = {
            subscriber_id,
        };
    });

    router.get('/take/:account/:subscriber_id/:task_ids?', async (ctx, next) => {
        const { account, subscriber_id, task_ids } = ctx.params;

        const remove_task_ids = task_ids ? task_ids.split('-').map(x=>+x) : [];

        try {
            const res = await Tarantool.instance('tarantool').call('notification_take', account, subscriber_id, remove_task_ids);
            ctx.body = { tasks: [res[0]] };
        } catch (error) {
            console.error(`[reqid ${ctx.request.header['x-request-id']}] ${ctx.method} ERRORLOG notifications @${account} ${error.message}`);
            ctx.body = { tasks: null };
        }
    });

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

module.exports = useNotificationsApi;
