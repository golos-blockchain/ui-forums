const koaRouter = require('koa-router');
const golos = require('golos-classic-js');
const JsonRPC = require('simple-jsonrpc-js');

function useNodeSendApi(app) {

    const router = koaRouter({prefix: '/node_send'});
    app.use(router.routes());

    const INVALID_REQUEST = -32600;

    router.all('/', async (ctx, next) => {
        ctx.set('Content-Type', 'application/json');
        ctx.set('Access-Control-Allow-Origin', '*')

        let jrpc = new JsonRPC();

        jrpc.on('call', 'pass', async (params) =>{
            if (params.length < 2 || params.length > 3) {
                throw jrpc.customException(INVALID_REQUEST, 'A member "params" should be ["api", "method", "args"]');
            }

            const [ api, method, args ] = params;
            if (!Array.isArray(args)) {
                throw jrpc.customException(INVALID_REQUEST, 'A member "args" should be array');
            }

            let result;
            try {
                result = await golos.api.sendAsync(
                    api,
                    {
                        method,
                        params: args,
                    });
            } catch (error) {
                if (error.payload) {
                    const { code, message, data } = error.payload.error;
                    throw jrpc.customException(code, message, data);
                } else { // http
                    const { code, message, data } = error;
                    throw jrpc.customException(code, message, data);
                }
            }

            return result;
        });

        jrpc.toStream = (message) => {
            ctx.body = message;
        };

        try {
            await jrpc.messageHandler(ctx.request.rawBody);
        } catch (err) {}
    });
}

module.exports = { useNodeSendApi };
