import ReactDOMServer from 'react-dom/server';
import golos from 'golos-classic-js';

import * as types from './actionTypes';
import * as CONFIG from '../../config';

import TimeAgoWrapper from '../utils/TimeAgoWrapper';
import { getAccountAvatarSrc } from '../utils/accountMetaUtils';

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
        let url = `${ CONFIG.REST_API }/msgs/chat/@${ account.name }/@${ to }`;
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();

            const memoKey = account.memoKey || '5JVFFWRLwz6JoP9kguuRFfytToGU6cLgBVTL9t6NB3D3BQLbUBS';

            let id = 0;
            let resultsDecrypted = []; // TODO: remove copying, just remove/hide invalid messages
            for (let msg of result.data.messages) {
                let public_key;
                if (account.data.memo_key === msg.to_memo_key) {
                    public_key = msg.from_memo_key;
                } else {
                    public_key = msg.to_memo_key;
                }

                try {
                    let message = golos.messages.decode(memoKey, public_key, msg);

                    message = JSON.parse(message).body;
                    let status = undefined; // no mark (for from's messages)
                    if (msg.from === account.name) {
                        if (msg.read_date.startsWith('1970')) {
                            status = 'sent'; // 1 mark (actually meansreceived)
                        } else {
                            status = 'read'; // 2 marks
                        }
                    }

                    // TODO: less trickly, separate as util
                    /*let dateString = ReactDOMServer.renderToString(<TimeAgoWrapper date={`${msg.create_date}Z`} />);
                    let dateEl = document.createElement('div');
                    dateEl.innerHTML = dateString;
                    dateString = dateEl.textContent;*/

                    resultsDecrypted.unshift({...msg,
                        id: ++id,
                        message,
                        author: msg.from,
                        timestamp: new Date(msg.receive_date).getTime(),
                        status,
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
            dispatch(fetchMessagesResolved({
                account,
                to: result.data.accounts[to],
                results: resultsDecrypted,
            }));
        } else {
            console.log(response);
            dispatch(fetchMessagesResolved({
                account,
                to: undefined,
            }));
        }
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

        let url = `${ CONFIG.REST_API }/msgs/contacts/@${ account.name }`;
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();

            const memoKey = account.memoKey || '5JVFFWRLwz6JoP9kguuRFfytToGU6cLgBVTL9t6NB3D3BQLbUBS';

            let contacts = result.data.contacts;
            for (let contact of contacts) {
                if (contact.last_message.receive_date.startsWith('1970')) {
                    contact.last_message.message = "";
                    continue;
                }

                let public_key;
                if (account.data.memo_key === contact.last_message.to_memo_key) {
                    public_key = contact.last_message.from_memo_key;
                } else {
                    public_key = contact.last_message.to_memo_key;
                }

                try {
                    let message = golos.messages.decode(memoKey, public_key, contact.last_message);

                    contact.last_message.message = JSON.parse(message).body;
                } catch (ex) {
                    console.log(ex);
                }

                contact.avatar = getAccountAvatarSrc(result.data.accounts[contact.contact].json_metadata);
            }
            dispatch(fetchContactsResolved({
                account,
                results: contacts
            }));
        }
    };
}

export function fetchContactsResolved(payload) {
    return {
        type: types.MESSAGES_CONTACTS_LOAD_RESOLVED,
        payload: payload
    };
}
