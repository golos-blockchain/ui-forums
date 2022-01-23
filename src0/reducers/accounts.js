import uniqBy from 'lodash/uniqBy';

import * as types from '../actions/actionTypes';

const initialAccounts = {
    auths: []
};

export default function accounts(state = initialAccounts, action) {
    switch (action.type) {
        case types.ACCOUNTS_REMOVE_ALL:
            return initialAccounts;
        case types.ACCOUNTS_ADD:
            let accounts = [].concat(state.auths);
            accounts.push({
                name: action.payload.account,
                key: action.payload.key,
            });
            return Object.assign({}, state, {
                auths: uniqBy(accounts, (e) => e.name)
            });
        default:
            return state;
    }
}
