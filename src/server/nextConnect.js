import nc from 'next-connect'

import { securityMiddleware, } from '@/server/security'

export default function nextConnect(opts = {}) {
    let handler
    handler = nc({ ...opts, })
    handler = handler.use(securityMiddleware)
    return handler
}
