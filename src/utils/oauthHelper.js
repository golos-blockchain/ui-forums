import golos from 'golos-lib-js'

export const useOAuthNode = (host) => {
    golos.config.set('websocket', new URL('/api/oauth/sign', host).toString())
    golos.config.set('credentials', 'include')
    golos.use(new golos.middlewares.OAuthMiddleware())
}
