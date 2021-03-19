import golos from 'golos-classic-js';

import * as types from '../actions/actionTypes';

const initialState = {
    messages: [],
    messageUpdate: '0',
    contacts: [],
    searchContacts: null,
};

export default function messages(state = initialState, action) {
    switch (action.type) {
        case types.MESSAGES_LOAD_RESOLVED: {
            const { results, to } = action.payload;
            return Object.assign({}, state, {
                messages: results,
                messageUpdate: results.length ? results[results.length - 1].nonce : '0',
                to: to,
            });
        }
        case types.MESSAGES_ADD_RESOLVED: {
            let messages = [...state.messages];
            messages.push(action.payload);
            return Object.assign({}, state, {
                messages,
            });
        }
        case types.MESSAGES_SEARCH_RESOLVED: {
            return Object.assign({}, state, {
                searchContacts: action.payload,
            });
        }
        case types.MESSAGES_CONTACTS_LOAD_RESOLVED: {
            return Object.assign({}, state, {
                contacts: action.payload.results,
                searchContacts: null,
            });
        }
        case types.MESSAGES_MESSAGED: {
            let { message, updateMessage, isMine, account } = action.payload;

            // adding fields
            message.author = message.from;
            message.date = new Date(message.receive_date + 'Z');
            if (isMine) {
                if (message.read_date.startsWith('19')) {
                    message.unread = true;
                }
            } else {
                if (message.read_date.startsWith('19')) {
                    message.toMark = true;
                }
            }

            // decoding
            let publicKey;
            if (message.from === account.data.name) {
                publicKey = message.to_memo_key;
            } else {
                publicKey = message.from_memo_key;
            }
            golos.messages.decode(account.memoKey, publicKey, [message], (msg) => {
                msg.message = JSON.parse(msg.message).body;
            });

            // updating state
            let newState = Object.assign({}, state);

            let messagesUpdate = message.nonce;
            if (updateMessage) {
                const idx = newState.messages.findIndex(i => i.nonce === message.nonce);
                if (idx === -1) {
                    newState.messages.push(message);
                } else {
                    newState.messages[idx] = message;
                }
            }

            newState.messagesUpdate = messagesUpdate;

            const cidx = newState.contacts.findIndex(i =>
                i.contact === message.to
                || i.contact === message.from);
            if (cidx === -1) {
                let contact = isMine ? message.to : message.from;
                newState.contacts.unshift({
                    contact,
                    last_message: message,
                    size: {
                        unread_inbox_messages: !isMine ? 1 : 0,
                    },
                });
            } else {
                newState.contacts[cidx].last_message = message;
                if (!isMine && !updateMessage) {
                    ++newState.contacts[cidx].size.unread_inbox_messages;
                }
            }
            const strCmp = (a, b) => a < b ? 1 : a > b ? -1 : 0;
            newState.contacts.sort((a, b) => {
                return strCmp(a.last_message.receive_date,
                    b.last_message.receive_date);
            });
            return newState;
        }
        case types.MESSAGES_MESSAGE_READ: {
            let { message, updateMessage, isMine } = action.payload;
            let newState = Object.assign({}, state);
            let messagesUpdate = message.nonce;

            if (updateMessage) {
                const idx = newState.messages.findIndex(i => i.nonce === message.nonce);
                if (idx !== -1) {
                    newState.messages[idx].read_date = message.read_date;
                    newState.messages[idx].unread = false;
                    newState.messages[idx].toMark = false;
                }
            }

            newState.messagesUpdate = messagesUpdate + 1;

            if (!isMine) {
                const cidx = newState.contacts.findIndex(i =>
                    i.contact === message.from);
                if (cidx !== -1) {
                    const { size } = newState.contacts[cidx];
                    size.unread_inbox_messages = Math.max(size.unread_inbox_messages - 1, 0);
                }
            }
            return newState;
        }
        default:
            return state;
    }
}
