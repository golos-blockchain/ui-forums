import * as CONFIG from '../../config';

const fixHost = (host) => {
    if (host.endsWith('/')) {
        host = host.slice(0, -1);
    }
    return host;
};
export const proxifyImageUrl = (url, dimensions = '0x0') => {
    if (!CONFIG || !CONFIG.STM_Config || !dimensions)
        return url;
    if (dimensions[dimensions.length - 1] !== '/')
        dimensions += '/';
    let prefix = '';
    if (CONFIG.STM_Config.img_proxy_prefix) prefix += fixHost(CONFIG.STM_Config.img_proxy_prefix) + '/' + dimensions;
    if (CONFIG.STM_Config.img_proxy_backup_prefix) prefix += fixHost(CONFIG.STM_Config.img_proxy_backup_prefix) + '/' + dimensions;
    return prefix + url;
};
