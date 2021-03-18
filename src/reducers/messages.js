import golos from 'golos-classic-js';

import * as types from '../actions/actionTypes';

const initialState = {
    messages: [],
    contacts: [],
    searchContacts: null,
};

export default function messages(state = initialState, action) {
    switch (action.type) {
        case types.MESSAGES_LOAD_RESOLVED: {
            return Object.assign({}, state, {
                messages: action.payload.results,
                to: action.payload.to,
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

            message.author = message.from;
            message.date = new Date(message.receive_date + 'Z');
            if (isMine) {
                if (message.read_date.startsWith('19')) {
                    message.unread = true;
                }
            }

            let publicKey;
            if (message.from === account.data.name) {
                publicKey = message.to_memo_key;
            } else {
                publicKey = message.from_memo_key;
            }

            golos.messages.decode(account.memoKey, publicKey, [message], (msg) => {
                msg.message = JSON.parse(msg.message).body;
            });

            let newState = Object.assign({}, state);
            if (updateMessage) {
                const idx = newState.messages.findIndex(i => i.nonce === message.nonce);
                if (idx === -1) {
                    newState.messages.push(message);
                } else {
                    newState.messages[idx] = message;
                }
            }
            return newState;
        }
        default:
            return state;
    }
}
