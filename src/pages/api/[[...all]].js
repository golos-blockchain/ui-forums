import nextConnect from '@/server/nextConnect';

import { corsMiddleware, } from '@/server/corsMiddleware';
import { getVersion, noBodyParser, bodyString, } from '@/server/misc';

let handler = nextConnect({ attachParams: true, })
    .use(corsMiddleware())

    .get('/api', (req, res) => {
        res.json({
            status: 'ok',
            date: new Date(),
            version: getVersion(),
        });
    })

    .post('/api/csp_violation', async (req, res) => {
        let params = await bodyString(req);
        if (typeof(params) === 'string') try {
            params = JSON.parse(params);
        } catch (err) {}
        console.log('-- /csp_violation -->', req.headers['user-agent'], params);
        res.json({});
    })

export default handler;

export {
    noBodyParser as config,
};
