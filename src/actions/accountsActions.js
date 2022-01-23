import * as types from '@/actions/actionTypes';

export function removeAccount() {
    return {
        type: types.ACCOUNTS_REMOVE
    };
}

export function removeAccounts() {
    return {
        type: types.ACCOUNTS_REMOVE_ALL
    };
}

export function addAccount(account, key, data) {
    let payload = {
        account: account,
        key: key,
        data: data
    };
    return {
        type: types.ACCOUNTS_ADD,
        payload: payload
    };
}

// export functions swapAccount(account, key)
