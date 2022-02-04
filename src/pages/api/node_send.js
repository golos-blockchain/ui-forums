import golos from 'golos-lib-js'
import JsonRPC from 'simple-jsonrpc-js'
import nextConnect from '@/server/nextConnect'
import { initGolos, } from '@/server/initGolos'
import { corsMiddleware, } from '@/server/corsMiddleware'
import { getVersion, noBodyParser, bodyString, } from '@/server/misc'

initGolos();

let handler = nextConnect()
    .use(corsMiddleware())

    .get('/api/node_send', async (req, res) => {
        res.json({
            version: getVersion()
        })
    })

    .post('/api/node_send', async (req, res) => {
        let jrpc = new JsonRPC()

        const INVALID_REQUEST = -32600

        jrpc.on('call', 'pass', async (params) =>{
            if (params.length < 2 || params.length > 3) {
                throw jrpc.customException(INVALID_REQUEST, 'A member "params" should be ["api", "method", "args"]')
            }

            let [ api, method, args ] = params;
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

            updateOffchainCache(params)

            return result;
        });

        jrpc.toStream = (message) => {
            res.setHeader('Content-Type', 'application/json')
                .send(message);
        };

        let rawBody
        try {
            rawBody = await bodyString(req);

            await jrpc.messageHandler(rawBody);
        } catch (err) {
            console.error('/node_send', rawBody);
        }
    })

export default handler

const updateOffchainCache = (params) => {
    if (!params || !global.forumCache) {
        return
    }

    let [ api, method, args ] = params;

    const isBroadcast = 
        (api == 'network_broadcast_api') &&
        (method === 'broadcast_transaction' || method === 'broadcast_transaction_with_callback');

    if (!isBroadcast) {
        return
    }

    let trx = method === 'broadcast_transaction_with_callback' ? args[1] : args[0]

    if (!trx || !trx.operations || !trx.operations.length) {
        return
    }

    for (const op of trx.operations) {
        if (op[0] === 'custom_json' && op[1] && op[1].id === 'account_notes') {
            let inOp
            try {
                inOp = JSON.parse(op[1].json)
            } catch (err) {
                console.error('Offchain error', err)
                continue
            }
            if (inOp[0] !== 'set_value' || !inOp[1].key || !inOp[1].value) {
                continue
            }
            const key = inOp[1].key
            let val = inOp[1].value

            const isAccs = key.endsWith('.accs')
            const isLst = key.endsWith('.lst')

            if (!val.length) {
                delete global.forumCache.vals[key]
            } else if (isAccs) {
                val = JSON.parse(val)
                global.forumCache.vals[key] = val
            } else if (isLst) {
                val = JSON.parse(val)
                if (global.forumCache.vals[key]) {
                    global.forumCache.vals[key] = {
                        ...global.forumCache.vals[key],
                        ...val,
                    }
                } else {
                    global.forumCache.vals[key] = val
                }
            }
        } else if (op[0] === 'comment') {
            console.log(op, global.forumCache)
        }
    }
}

export {
    noBodyParser as config,
}
