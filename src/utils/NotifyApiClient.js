import * as CONFIG from '../../config';

const request_base = {
    method: 'post',
    credentials: 'include',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
};

const notifyAvailable = () => {
    return /*process.env.BROWSER &&*/ CONFIG.NOTIFY_SERVICE && CONFIG.NOTIFY_SERVICE.host;
};

const notifyUrl = (pathname) => {
    return new URL(pathname, CONFIG.NOTIFY_SERVICE.host).toString();
};

export function notifyApiLogin(account, signatures) {
    if (!notifyAvailable()) return;
    const request = Object.assign({}, request_base, {
        body: JSON.stringify({account, signatures}),
    });
    return fetch(notifyUrl(`/login_account`), request).then(r => r.json());
}

export function notifyApiLogout() {
    if (!notifyAvailable()) return;
    const request = Object.assign({}, request_base, {
        method: 'get',
    });
    fetch(notifyUrl(`/logout_account`), request);
}

export function getNotifications(account) {
    if (!notifyAvailable()) return Promise.resolve(null);
    const request = Object.assign({}, request_base, {method: 'get'});
    return fetch(notifyUrl(`/counters/@${account}`), request).then(r => r.json()).then(res => {
        return res;
    });
}

export function markNotificationRead(account, fields) {
    if (!notifyAvailable()) return Promise.resolve(null);
    const request = Object.assign({}, request_base, {method: 'put'});
    return fetch(notifyUrl(`/counters/@${account}/${fields}`), request).then(r => r.json()).then(res => {
        return res;
    });
}

export async function notificationSubscribe(account, subscriber_id = '') {
    if (!notifyAvailable()) return;
    if (window.__subscriber_id) return;
    try {
        const request = Object.assign({}, request_base, {method: 'get'});
        let response = await fetch(notifyUrl(`/subscribe/@${account}/${subscriber_id}`), request);
        if (response.ok) {
            const result = await response.json();
            window.__subscriber_id = result.subscriber_id;
        }
    } catch (ex) {
        console.error(ex)
    }
    if (!window.__subscriber_id) {
        throw new Error('Cannot subscribe');
    }
}

export async function notificationTake(account, removeTaskIds, forEach) {
    if (!notifyAvailable()) return;
    let url = notifyUrl(`/take/@${account}/${window.__subscriber_id}`);
    if (removeTaskIds)
        url += '/' + removeTaskIds;
    let response;
    try {
        const request = Object.assign({}, request_base, {method: 'get'});
        response = await fetch(url, request);
        if (response && response.ok) {
            const result = await response.json();
            if (Array.isArray(result.tasks)) {
                removeTaskIds = '';

                let removeTaskIdsArr = [];
                for (let task of result.tasks) {
                    const task_id = task[0];
                    const { data, timestamp } = task[2];
                    const [ type, op ] = data;

                    forEach(type, op, timestamp, task_id);

                    removeTaskIdsArr.push(task_id.toString());
                }

                removeTaskIds = removeTaskIdsArr.join('-');

                return removeTaskIds;
            }
        }
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
}

/*if (process.env.BROWSER) {
    window.getNotifications = getNotifications;
    window.markNotificationRead = markNotificationRead;
    window.notificationSubscribe = notificationSubscribe;
    window.notificationTake = notificationTake;
}*/
