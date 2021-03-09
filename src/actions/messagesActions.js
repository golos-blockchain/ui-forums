import ReactDOMServer from 'react-dom/server';
import golos from 'golos-classic-js';

import * as types from './actionTypes';
import * as CONFIG from '../../config';

import TimeAgoWrapper from '../utils/TimeAgoWrapper';

export function addMessage(account, to, toMemoKey, body) {
    return async dispatch => {
        let message = {
            app: 'golos-id',
            version: 1,
            body,
        };

        const memoKey = account.memoKey || '5JVFFWRLwz6JoP9kguuRFfytToGU6cLgBVTL9t6NB3D3BQLbUBS';

        const data = golos.messages.encode(memoKey, toMemoKey, JSON.stringify(message));

        const json = JSON.stringify(['private_message', {
            from: account.name,
            to,
            nonce: data.nonce.toString(),
            from_memo_key: account.data.memo_key,
            to_memo_key: toMemoKey,
            checksum: data.checksum,
            update: false,
            encrypted_message: data.message,
        }]);
        golos.broadcast.customJson(account.key, [], [account.name], 'private_message', json, (err, result) => {
            alert(err);
            alert(JSON.stringify(result));
        });
    };
}

export function fetchMessages(account, to) {
    return async dispatch => {
        if (!account.data) return;
        let toAcc = await golos.api.getAccountsAsync([to]);
        toAcc = toAcc[0];
        golos.api.getThread(account.name, to, {}, (err, results) => {
            const memoKey = account.memoKey || '5JVFFWRLwz6JoP9kguuRFfytToGU6cLgBVTL9t6NB3D3BQLbUBS';
            if (err) {
                console.log(err);
                alert(err);
                dispatch(fetchMessagesResolved({
                    account,
                    toMemoKey: toAcc.memo_key,
                }));
                return;
            }
            let id = 0;
            let resultsDecrypted = []; // TODO: remove copying, just remove/hide invalid messages
            for (let result of results) {
                let public_key;
                if (account.data.memo_key === result.to_memo_key) {
                    public_key = result.from_memo_key;
                } else {
                    public_key = result.to_memo_key;
                }

                try {
                    let message = golos.messages.decode(memoKey, public_key, result);

                    message = JSON.parse(message).body;
                    let status = undefined; // no mark (for from's messages)
                    if (result.from === account.name) {
                        if (result.read_date.startsWith('1970')) {
                            status = 'sent'; // 1 mark (actually meansreceived)
                        } else {
                            status = 'read'; // 2 marks
                        }
                    }

                    // TODO: less trickly, separate as util
                    /*let dateString = ReactDOMServer.renderToString(<TimeAgoWrapper date={`${result.create_date}Z`} />);
                    let dateEl = document.createElement('div');
                    dateEl.innerHTML = dateString;
                    dateString = dateEl.textContent;*/

                    resultsDecrypted.unshift({...result,
                        id: ++id,
                        message,
                        author: result.from,
                        timestamp: new Date(result.receive_date).getTime(),
                        status,
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
            dispatch(fetchMessagesResolved({
                account,
                toMemoKey: toAcc.memo_key,
                results: resultsDecrypted,
            }));
        });
    };
}

export function fetchMessagesResolved(payload) {
    return {
        type: types.MESSAGES_LOAD_RESOLVED,
        payload: payload
    };
}

export function fetchContacts(account) {
    return async dispatch => {
        if (!account.data) return;
        golos.api.getContacts(account.name, 'unknown', 100, 0, (err, results) => {
            const memoKey = account.memoKey || '5JVFFWRLwz6JoP9kguuRFfytToGU6cLgBVTL9t6NB3D3BQLbUBS';
            if (err) {
                console.log(err);
                alert(err);
                dispatch(fetchContactsResolved({
                    account
                }));
                return;
            }
            for (let result of results) {
                if (result.last_message.receive_date.startsWith('1970')) {
                    result.last_message.message = "";
                    continue;
                }

                let public_key;
                if (account.data.memo_key === result.last_message.to_memo_key) {
                    public_key = result.last_message.from_memo_key;
                } else {
                    public_key = result.last_message.to_memo_key;
                }

                try {
                    let message = golos.messages.decode(memoKey, public_key, result.last_message);

                    result.last_message.message = JSON.parse(message).body;
                } catch (ex) {
                    console.log(ex);
                }
            }
            dispatch(fetchContactsResolved({
                account,
                results
            }));
        });
    };
}

export function fetchContactsResolved(payload) {
    return {
        type: types.MESSAGES_CONTACTS_LOAD_RESOLVED,
        payload: payload
    };
}
