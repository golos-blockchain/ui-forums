import * as CONFIG from '../../config';

export function getAccountAvatarSrc(json_metadata) {
    let src = '/images/userpic.png';
    let meta = null;
    try {
        meta = JSON.parse(json_metadata);
    } catch (ex) {
    }
    if (meta && meta.profile && meta.profile.profile_image) {
        src = meta.profile.profile_image;
        src = CONFIG.STM_Config.img_proxy_prefix ? (CONFIG.STM_Config.img_proxy_prefix + '0x0/' + src) : src;
    }
    return src;
}
