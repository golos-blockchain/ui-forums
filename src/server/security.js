import { createHeadersObject,
    withSecureHeaders as _withSecureHeaders, } from 'next-secure-headers'

import CONFIG from '@/config'

function convertEntriesToArrays(obj) {
    return Object.keys(obj).reduce((result, key) => {
        result[key] = obj[key].split(/\s+/) // split by space
        return result
    }, {})
}

let cspDirectives = convertEntriesToArrays(CONFIG.helmet.directives)
cspDirectives.reportURI = new URL('/api/csp_violation', CONFIG.rest_api)
// TODO: it should be relative, instead of using config. But next-secure-headers do not supports it

const secureHeadersOpts = {
    contentSecurityPolicy: {
        directives: cspDirectives,
    },
    referrerPolicy: 'no-referrer',
}

const secureHeaders = createHeadersObject(secureHeadersOpts)

export const setSecureHeaders = (res) => {
    for (let [key, val] of Object.entries(secureHeaders)) {
        res.setHeader(key, val)
    }
}

export const securityMiddleware = async (req, res, next) => {
    setSecureHeaders(res)
    next()
}
