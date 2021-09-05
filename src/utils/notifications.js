import { Signature, hash } from 'golos-lib-js/lib/auth/ecc';

import { notifyApiLogin, notifyApiLogout } from './NotifyApiClient';

export async function notifyLogin(account, posting_key) {
    const res = await notifyApiLogin(account, null);
    if (res.already_authorized === account)
        return;
    console.log('login_challenge', res.login_challenge);

    const signatures = {};
    const challenge = {token: res.login_challenge};
    const bufSha = hash.sha256(JSON.stringify(challenge, null, 0));
    const sign = (role, d) => {
    if (!d) return;
        const sig = Signature.signBufferSha256(bufSha, d);
        signatures[role] = sig.toHex();
    };
    sign('posting', posting_key);
    await notifyApiLogin(account, signatures);
}

export async function notifyLogout() {
    await notifyApiLogout();
}
