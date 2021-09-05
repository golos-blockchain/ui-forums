//import ReactDOMServer from 'react-dom/server';
import golos from 'golos-lib-js';
import tt from 'counterpart';

import * as types from './actionTypes';
import * as CONFIG from '../../config';

//import TimeAgoWrapper from '../utils/TimeAgoWrapper';
import { getAccountAvatarSrc } from '../utils/accountMetaUtils';
import { getMemoKey } from '../utils/MessageUtils';
import { fitToPreview } from '../utils/ImageUtils';
import { sendOffchainMessage } from '../utils/NotifyApiClient';

export function sendMessage(account, to, toMemoKey, body, editInfo = undefined, type = 'text', meta = {}, replyingMessage = null) {
    return async dispatch => {
        let message = {
            app: 'golos-messenger',
            version: 1,
            body,
        };
        if (type !== 'text') {
            message.type = type;
            if (type === 'image') {
                message = { ...message, ...fitToPreview(600, 300, meta.width, meta.height), };
            } else {
                throw new Error('Unknown message type: ' + type);
            }
        }
        if (replyingMessage) {
            message = {...message, ...replyingMessage};
        }

        const memoKey = getMemoKey(account);

        const data = golos.messages.encode(memoKey, toMemoKey, message, editInfo ? editInfo.nonce : undefined);

        const opData = {
            from: account.name,
            to,
            nonce: editInfo ? editInfo.nonce : data.nonce.toString(),
            from_memo_key: account.data.memo_key,
            to_memo_key: toMemoKey,
            checksum: data.checksum,
            update: editInfo ? true : false,
            encrypted_message: data.encrypted_message,
        };

        if (!editInfo) {
            sendOffchainMessage(opData);
        }

        const json = JSON.stringify(['private_message', opData]);
        golos.broadcast.customJson(account.key, [], [account.name], 'private_message', json, (err, result) => {
            if (err) {
                alert(err);
                return;
            }

            if (!!editInfo)
                return;

            const now = new Date().toISOString().split('.')[0];

            let msg = {
                from: account.name,
                to,
                from_memo_key: account.data.memo_key,
                to_memo_key: toMemoKey,
                nonce: data.nonce.toString(),
                checksum: data.checksum,
                encrypted_message: data.encrypted_message,
                create_date: now,
                receive_date: '1970-01-01T00:00:00',
                read_date: '1970-01-01T00:00:00',
                remove_date: '1970-01-01T00:00:00',

                id: 134,
                author: account.name,
                date: new Date(),
                unread: true,
                message,
            };
            dispatch(addMessageResolved(msg));
        });
    };
}

export function addMessageResolved(payload) {
    return {
        type: types.MESSAGES_ADD_RESOLVED,
        payload: payload,
    };
}

export function fetchMessages(account, to) {
    return async dispatch => {
        if (!account.data) return;
        let url = `${ CONFIG.REST_API }/msgs/chat/@${ account.name }/@${ to }`;
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();

            const memoKey = getMemoKey(account);

            let public_key = result.data.accounts[to].memo_key;

            const tt_invalid_message = tt('messages.invalid_message');

            let id = 0;
            let resultsDecrypted = golos.messages.decode(memoKey, public_key, result.data.messages,
                (msg, i, results) => {
                    msg.id = ++id;
                    msg.author = msg.from;
                    msg.date = new Date(msg.create_date + 'Z');

                    if (msg.from === account.data.name) {
                        if (msg.read_date.startsWith('19')) {
                            msg.unread = true;
                        }
                    } else {
                        if (msg.read_date.startsWith('19')) {
                            msg.toMark = true;
                        }
                    }
                },
                undefined,
                (msg, i, err) => {
                    console.log(err);
                    msg.message = { body: tt_invalid_message, invalid: true, };
                },
                result.data.messages.length - 1, -1);
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

            const memoKey = getMemoKey(account);

            const tt_invalid_message = tt('messages.invalid_message');

            let contacts = result.data.contacts;
            for (let contact of contacts) {
                contact.avatar = getAccountAvatarSrc(result.data.accounts[contact.contact].json_metadata);

                if (contact.last_message.create_date.startsWith('1970')) {
                    contact.last_message.message = { body: '' };
                    continue;
                }

                let public_key;
                if (account.data.memo_key === contact.last_message.to_memo_key) {
                    public_key = contact.last_message.from_memo_key;
                } else {
                    public_key = contact.last_message.to_memo_key;
                }

                golos.messages.decode(memoKey, public_key, [contact.last_message],
                    undefined,
                    undefined,
                    (msg, i, err) => {
                        console.log(err);
                        msg.message = { body: tt_invalid_message, invalid: true, };
                    }, 0, 1);
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

export function searchContacts(selfName, query) {
    return async dispatch => {
        if (!query) {
            dispatch(searchContactsResolved(null));
            return;
        }

        let url = `${ CONFIG.REST_API }/msgs/contacts/search/${ query }`;
        const response = await fetch(url);
        if (response.ok) {
            let result = await response.json();
            let contacts = [];
            for (let account of result.data) {
                if (account.memo_key === 'GLS1111111111111111111111111111111114T1Anm'
                    || account.name === selfName) {
                    continue;
                }
                account.contact = account.name;
                account.avatar = getAccountAvatarSrc(account.json_metadata);
                contacts.push(account);
            }
            if (contacts.length === 0) {
                contacts = [{
                    contact: tt('messages.search_not_found'),
                    isSystemMessage: true,
                }];
            }
            dispatch(searchContactsResolved(contacts));
        } else {
            dispatch(searchContactsResolved(null));
        }
    };
}

export function searchContactsResolved(payload) {
    return {
        type: types.MESSAGES_SEARCH_RESOLVED,
        payload: payload,
    };
}

export function messaged(message, timestamp, updateMessage, isMine, account) {
    return {
        type: types.MESSAGES_MESSAGED,
        payload: {message, timestamp, updateMessage, isMine, account},
    };
}

export function messageEdited(message, timestamp, updateMessage, isMine, account) {
    return {
        type: types.MESSAGES_EDITED,
        payload: {message, timestamp, updateMessage, isMine, account},
    };
}

export function messageRead(message, timestamp, updateMessage, isMine) {
    return {
        type: types.MESSAGES_READ,
        payload: {message, timestamp, updateMessage, isMine},
    };
}

export function messageDeleted(message, updateMessage, isMine) {
    return {
        type: types.MESSAGES_DELETED,
        payload: {message, updateMessage, isMine},
    };
}

export function sendOperations(account, to, operations) {
    return async dispatch => {
        if (!operations.length || !account) return;

        golos.broadcast.send({
                operations,
                extensions: []
            }, [account.key], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });
    }
}
