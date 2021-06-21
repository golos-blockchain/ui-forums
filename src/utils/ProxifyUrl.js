import * as CONFIG from '../../config';

export const proxifyImageUrl = (url, dimensions = '0x0') => {
    if (!CONFIG || !CONFIG.STM_Config || !dimensions)
        return url;
    if (dimensions[dimensions.length - 1] !== '/')
        dimensions += '/';
    let prefix = '';
    if (CONFIG.STM_Config.img_proxy_prefix) prefix += CONFIG.STM_Config.img_proxy_prefix + dimensions;
    if (CONFIG.STM_Config.img_proxy_backup_prefix) prefix += CONFIG.STM_Config.img_proxy_backup_prefix + dimensions;
    return prefix + url;
};
