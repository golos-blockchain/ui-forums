import { Signature, hash } from 'golos-classic-js/lib/auth/ecc';

import { authApiLogin, authApiLogout } from './AuthApiClient';
import { notifyApiLogin, notifyApiLogout } from './NotifyApiClient';

export async function notifyLogin(account, posting_key) {
    let res = await notifyApiLogin(account, localStorage.getItem('X-Auth-Session'));
    if (res.status === 'ok')
        return;

    res = await authApiLogin(account, null);
    if (!res.already_authorized) {
        if (!res.login_challenge) {
            console.error('authApiLogin-1 error', JSON.stringify(res));
        }
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
        res = await authApiLogin(account, signatures);
        if (res.status !== 'ok') {
            console.error('authApiLogin-2 error', JSON.stringify(res), account, signatures);
        }
    }

    res = await notifyApiLogin(account, localStorage.getItem('X-Auth-Session'));
    if (res.status !== 'ok') {
        console.error('notifyApiLogin error', JSON.stringify(res));
        throw new Error(res.error);
    }
}

export async function notifyLogout() {
    try {
        await notifyApiLogout();
    } catch (err) {
        console.error('notifyApiLogout error', err);
    }
    try {
        await authApiLogout();
    } catch (err) {
        console.error('authApiLogout error', err);
    }
}
