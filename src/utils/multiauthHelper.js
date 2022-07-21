import golos from 'golos-lib-js'

export const useMultiAuth = (oAuthHost) => {
    if (oAuthHost) {
        golos.config.set('websocket', new URL('/api/oauth/sign', oAuthHost).toString())
        golos.config.set('credentials', 'include')
    }
    golos.use(new golos.middlewares.MultiAuthMiddleware())
}
