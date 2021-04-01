//import ReactDOMServer from 'react-dom/server';
import golos from 'golos-classic-js';
import tt from 'counterpart';

import * as types from './actionTypes';
import * as CONFIG from '../../config';

//import TimeAgoWrapper from '../utils/TimeAgoWrapper';
import { getAccountAvatarSrc } from '../utils/accountMetaUtils';
import { assignDecodedMessageFields } from '../utils/MessageUtils';
import { fitToPreview } from '../utils/ImageUtils';

export function sendMessage(account, to, toMemoKey, body, editInfo = undefined, type = 'text', meta = {}) {
    return async dispatch => {
        let message = {
            app: 'golos-id',
            version: 1,
            body,
            ...meta,
        };
        if (type !== 'text') {
            message.type = type;
            if (type === 'image') {
                // For clients who don't want use img proxy by themself
                message.preview = CONFIG.STM_Config.img_proxy_prefix + '600x300/' + body;
                message = { ...message, ...fitToPreview(600, 300, meta.width, meta.height), };
            } else {
                throw new Error('Unknown message type: ' + type);
            }
        }
        const jsonMessage = message;
        message = JSON.stringify(message);

        const memoKey = account.memoKey;

        const data = golos.messages.encode(memoKey, toMemoKey, message, editInfo ? editInfo.nonce : undefined);

        const json = JSON.stringify(['private_message', {
            from: account.name,
            to,
            nonce: editInfo ? editInfo.nonce : data.nonce.toString(),
            from_memo_key: account.data.memo_key,
            to_memo_key: toMemoKey,
            checksum: data.checksum,
            update: editInfo ? true : false,
            encrypted_message: data.encrypted_message,
        }]);
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
            };
            assignDecodedMessageFields(msg, jsonMessage);
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

            const memoKey = account.memoKey;

            let public_key = result.data.accounts[to].memo_key;

            let id = 0;
            let resultsDecrypted = golos.messages.decode(memoKey, public_key, result.data.messages,
                    (msg) => {
                    msg.id = ++id;
                    msg.author = msg.from;
                    msg.date = new Date(msg.receive_date + 'Z');

                    if (msg.from === account.data.name) {
                        if (msg.read_date.startsWith('19')) {
                            msg.unread = true;
                        }
                    } else {
                        if (msg.read_date.startsWith('19')) {
                            msg.toMark = true;
                        }
                    }

                    const decoded = JSON.parse(msg.message);
                    assignDecodedMessageFields(msg, decoded);

                    return true;
                }, result.data.messages.length - 1, -1,
                (msg, i, err) => {
                    console.log(err);
                });
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

            const memoKey = account.memoKey;

            let contacts = result.data.contacts;
            for (let contact of contacts) {
                contact.avatar = getAccountAvatarSrc(result.data.accounts[contact.contact].json_metadata);

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

                golos.messages.decode(memoKey, public_key, [contact.last_message],
                    (message_object) => {
                        message_object.message = JSON.parse(message_object.message).body;
                    }, 0, 1, (msg, i, err) => {
                        console.log(err);
                    });
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

export function messaged(message, updateMessage, isMine, account) {
    return {
        type: types.MESSAGES_MESSAGED,
        payload: {message, updateMessage, isMine, account},
    };
}

export function messageEdited(message, updateMessage, isMine, account) {
    return {
        type: types.MESSAGES_EDITED,
        payload: {message, updateMessage, isMine, account},
    };
}

export function messageRead(message, updateMessage, isMine) {
    return {
        type: types.MESSAGES_READ,
        payload: {message, updateMessage, isMine},
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
