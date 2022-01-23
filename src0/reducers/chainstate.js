import * as types from '../actions/actionTypes';

const initialState = {
    accounts: {},
    paths: {},
    props: {},
};

export default function chainstate(state = initialState, action) {
    switch (action.type) {
        case types.CHAINSTATE_GLOBAL_PROPS_RESOLVED: {
            return Object.assign({}, state, { props: action.payload });
        }
        case types.CHAINSTATE_ACCOUNT_LOAD_RESOLVED: {
            const accounts = Object.assign({}, state.accounts, {
                [action.payload.name]: Object.assign({}, action.payload, {ts: action.ts})
            });
            return Object.assign({}, state, { accounts });
        }
        default:
            return state;
    }
}
