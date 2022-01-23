import * as CONFIG from '@/config';

const fixHost = (host) => {
    if (host.endsWith('/')) {
        host = host.slice(0, -1);
    }
    return host;
};
export const proxifyImageUrl = (url, dimensions = '0x0') => {
    if (!CONFIG || !CONFIG.images || !dimensions)
        return url;
    if (dimensions[dimensions.length - 1] !== '/')
        dimensions += '/';
    let prefix = '';
    if (CONFIG.images.img_proxy_prefix) prefix += fixHost(CONFIG.images.img_proxy_prefix) + '/' + dimensions;
    if (CONFIG.images.img_proxy_backup_prefix) prefix += fixHost(CONFIG.images.img_proxy_backup_prefix) + '/' + dimensions;
    return prefix + url;
};
