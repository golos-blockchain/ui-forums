export function msgsHost() {
    return $GLS_Config && $GLS_Config.messenger_service && $GLS_Config.messenger_service.host
}

export function msgsLink(to = '') {
    try {
        const host = msgsHost()
        if (!host) {
            console.error('No messenger_service in config, but used in links!')
            return ''
        }
        if (to && !to.includes('@')) {
            to = '@' + to
        }
        let url = new URL(to || '', host)
        return url.toString()
    } catch (err) {
        console.error(err)
        return ''
    }
}
