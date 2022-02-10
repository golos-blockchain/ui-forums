const fixHost = (host) => {
    if (host.endsWith('/')) {
        host = host.slice(0, -1);
    }
    return host;
};
export const proxifyImageUrl = (url, dimensions = '0x0') => {
    if (!$GLS_Config || !$GLS_Config.images || !dimensions)
        return url;
    if (dimensions[dimensions.length - 1] !== '/')
        dimensions += '/';
    let prefix = '';
    if ($GLS_Config.images.img_proxy_prefix) prefix += fixHost($GLS_Config.images.img_proxy_prefix) + '/' + dimensions;
    if ($GLS_Config.images.img_proxy_backup_prefix) prefix += fixHost($GLS_Config.images.img_proxy_backup_prefix) + '/' + dimensions;
    return prefix + url;
};
