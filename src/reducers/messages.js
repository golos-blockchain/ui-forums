import * as types from '../actions/actionTypes';

const initialState = {
    messages: [],
    contacts: []
};

export default function messages(state = initialState, action) {
    switch (action.type) {
        case types.MESSAGES_LOAD_RESOLVED: {
            return Object.assign({}, state, {
                messages: action.payload.results,
                toMemoKey: action.payload.toMemoKey,
            });
        }
        case types.MESSAGES_CONTACTS_LOAD_RESOLVED: {
            return Object.assign({}, state, {
                contacts: action.payload.results,
            });
        }
        default:
            return state;
    }
}
