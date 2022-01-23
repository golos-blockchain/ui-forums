import * as types from '@/actions/actionTypes';

export default function preferences(state = false, action) {
    switch (action.type) {
        case types.SET_PREFERENCE:
            let newState = Object.assign({}, state, action.payload);
            return newState;
        default:
            return state;
    }
}

export const getPreference = (state, key) => {
    return state[key];
};
