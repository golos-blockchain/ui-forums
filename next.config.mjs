
// WARNING: It is build-phase only config.
// All code will be called only on build ("yarn run build") and compiled to static data.
// Do not write here code which should have ability to change on server restart ("yarn run production").

export default {
    async rewrites() {
        return [
            {
                source: '/:category/@:author/:permlink/:action*',
                destination: '/post/:category/:author/:permlink/:action*',
            },
            {
                source: '/@:username/:section*',
                destination: '/account/:username/:section*',
            },
        ]
    },
}
