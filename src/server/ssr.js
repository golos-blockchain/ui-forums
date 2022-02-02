import config from 'config'

import { wrapper, } from '@/store'
import { setSecureHeaders, } from '@/server/security'
import { initNative, } from '@/server/initGolos'

function initConfig() {
    let cfg = {
        golos_chain_id: config.get('golos_chain_id'),
        site_domain: config.get('site_domain'),
        forum: config.get('forum'),
        images: config.get('images'),
        auth_service: config.get('auth_service'),
        notify_service: config.get('notify_service'),
        elastic_search: config.get('elastic_search'),
        helmet: config.get('helmet'),
        anti_phishing: config.get('anti_phishing'),
    }
    if (config.get('proxy_node')) {
        cfg.golos_node = new URL('/api/node_send', cfg.site_domain).toString()
    } else {
        cfg.golos_node = config.get('golos_server_node')
    }
    global.$GLS_Config = cfg
    return cfg
}

export const wrapSSR = (ssrHandler) => {
    return wrapper.getServerSideProps(store => async (context) => {
        setSecureHeaders(context.res)
        await initNative()
        const newContext = { ...context, _store: store }
        const cfg = initConfig()
        let ret = await ssrHandler(newContext)
        if (ret.props) 
            ret.props._golos_config = cfg
        return ret
    });
}
