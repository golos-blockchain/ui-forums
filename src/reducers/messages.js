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
        default:
            return state;
    }
}
