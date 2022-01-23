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

export {
    noBodyParser as config,
}
