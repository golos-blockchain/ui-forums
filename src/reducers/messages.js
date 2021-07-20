import golos from 'golos-classic-js';
import tt from 'counterpart';

import * as types from '../actions/actionTypes';

import { getMemoKey } from '../utils/MessageUtils';

const initialState = {
    messages: [],
    messageUpdate: '0',
    contacts: [],
    searchContacts: null,
};

function processDatedGroup(group, messages, for_each) {
    if (group.nonce) {
        const idx = messages.findIndex(i => i.nonce === group.nonce);
        if (idx !== -1) {
            const msg = messages[idx];
            for_each(msg, idx);
        }
    } else {
        let inRange = false;
        const start_date = new Date(group.start_date + 'Z');
        const stop_date = new Date(group.stop_date + 'Z');
        for (let idx = messages.length - 1; idx >= 0; --idx) {
            const msg = messages[idx];
            if (!inRange && msg.date <= stop_date) {
                inRange = true;
            }
            if (msg.date <= start_date) {
                break;
            }
            if (inRange) {
                for_each(msg, idx);
            }
        }
    }
}

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
            const idx = messages.findIndex(i => i.nonce === action.payload.nonce);
            if (idx === -1) {
                messages.push(action.payload);
            }
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
            let { message, timestamp, updateMessage, isMine, account } = action.payload;

            // adding fields
            message.create_date = timestamp;
            message.receive_date = timestamp;

            message.date = new Date(message.create_date + 'Z');
            message.author = message.from;
            if (isMine) {
                message.unread = true;
            } else {
                message.toMark = true;
            }

            // decoding
            let publicKey;
            if (message.from === account.data.name) {
                publicKey = message.to_memo_key;
            } else {
                publicKey = message.from_memo_key;
            }
            golos.messages.decode(getMemoKey(account), publicKey, [message],
                undefined,
                undefined,
                (msg, i, err) => {
                    console.log(err);
                    const tt_invalid_message = tt('messages.invalid_message');
                    msg.message = { body: tt_invalid_message, invalid: true, };
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
        case types.MESSAGES_EDITED: {
            let { message, timestamp, updateMessage/*, isMine*/, account } = action.payload;

            if (!updateMessage)
                return state;

            // decoding
            let publicKey;
            if (message.from === account.data.name) {
                publicKey = message.to_memo_key;
            } else {
                publicKey = message.from_memo_key;
            }
            golos.messages.decode(getMemoKey(account), publicKey, [message], (msg) => {
            });

            // updating state
            let newState = Object.assign({}, state);

            let messagesUpdate = message.nonce;

            const idx = newState.messages.findIndex(i => i.nonce === message.nonce);
            if (idx !== -1) {
                let dest = newState.messages[idx];
                dest.receive_date = timestamp;
                dest.checksum = message.checksum;
                dest.encrypted_message = message.encrypted_message;
                dest.raw_message = message.raw_message;
                dest.message = message.message;
            }

            newState.messagesUpdate = messagesUpdate + 2;

            return newState;
        }
        case types.MESSAGES_READ: {
            let { message, timestamp, updateMessage, isMine } = action.payload;
            let newState = Object.assign({}, state);
            let messagesUpdate = message.nonce;

            if (updateMessage) {
                processDatedGroup(message, newState.messages, (msg, idx) => {
                    msg.read_date = timestamp;
                    msg.unread = false;
                    msg.toMark = false;
                });
            }

            newState.messagesUpdate = messagesUpdate + 1;

            if (!isMine) {
                const cidx = newState.contacts.findIndex(i =>
                    i.contact === message.from);
                if (cidx !== -1) {
                    const { size } = newState.contacts[cidx];
                    size.unread_inbox_messages = 0;
                }
            }
            return newState;
        }
        case types.MESSAGES_DELETED: {
            let { message, updateMessage/*, isMine*/ } = action.payload;
            let newState = Object.assign({}, state);
            if (updateMessage) {
                const idx = newState.messages.findIndex(i => i.nonce === message.nonce);
                if (idx !== -1) {
                    newState.messages.splice(idx, 1);
                }
            }
            return newState;
        }
        default:
            return state;
    }
}
