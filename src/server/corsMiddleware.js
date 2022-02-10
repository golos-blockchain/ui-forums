import config from 'config'
import cors from 'cors'

function corsMiddleware(opts = {}) {
    return cors({
        origin: true,
        credentials: true,
        ...opts,
    })
}

module.exports = {
    corsMiddleware,
}
