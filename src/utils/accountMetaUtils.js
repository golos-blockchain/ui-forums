import { proxifyImageUrl } from './ProxifyUrl';

export function getAccountAvatarSrc(json_metadata) {
    let src = '/images/userpic.png';
    let meta = null;
    try {
        meta = JSON.parse(json_metadata);
    } catch (ex) {
    }
    if (meta && meta.profile && meta.profile.profile_image) {
        src = meta.profile.profile_image;
        src = proxifyImageUrl(src);
    }
    return src;
}
