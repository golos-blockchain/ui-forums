import golos from 'golos-classic-js';
import store from 'store';
import Noty from 'noty';

import * as types from './actionTypes';
import * as AccountsActions from './accountsActions';
import * as chainstateActions from './chainstateActions';

export function claimRewards(params) {
    return (dispatch: () => void) => {
        const { account, reward_steem, reward_sbd, reward_vests } = params;
        const { name, key } = account;
        const ops = [
            ['claim_reward_balance', {
                account: name,
                reward_steem,
                reward_sbd,
                reward_vests
            }]
        ];
        golos.broadcast.send({
            operations: ops,
            extensions: []
        }, {
            posting: key
        }, (err, result) => {
            dispatch(chainstateActions.getAccounts([name]));
            new Noty({
                closeWith: ['click', 'button'],
                layout: 'topRight',
                progressBar: true,
                theme: 'semanticui',
                text: 'Rewards successfully claimed!',
                type: 'success',
                timeout: 8000
            }).show();
        });
    };
}

export function fetchAccount(account) {
    return dispatch => {
        let payload = {
            isUser: (account !== 'undefined'),
            name: account,
        };
        dispatch({
            type: types.ACCOUNT_FETCH,
            payload: payload,
            loading: true
        });
        if (payload.isUser && payload.name) {
            setTimeout(function() {
                golos.api.getAccounts([payload.name], (err, data) => {
                    golos.api.getAccountsBalances([payload.name], (err2, data2) => {
                        data[0].uia_balances = data2[0];
                        dispatch(fetchAccountResolved(Object.assign({}, payload, {
                            data: data[0],
                            loading: false
                        })));
                        dispatch(fetchAccountFollowing(payload.name));
                    });
                });
            }, 50);
        }
    }
}

export function fetchAccountFollowing(name, start="", limit=100) {
    return dispatch => {
        golos.api.getFollowing(name, start, "blog", limit, (err, result) => {
            if (!result) return;
            const accounts = result.map((c) => { return c.following });
            if (result.length === limit) {
                const last = result[result.length-1].following;
                setTimeout(function() {
                  dispatch(fetchAccountFollowing(name, last, limit))
                }, 50);
            }
            dispatch({
                type: types.ACCOUNT_FOLLOWING_APPEND,
                following: accounts
            });
        });
    };
}

export function fetchAccountResolved(payload) {
    return {
        type: types.ACCOUNT_FETCH,
        payload: payload
    };
}

export function signoutAccount() {
    return (dispatch: () => void) => {
        dispatch(AccountsActions.removeAccounts());
        dispatch({
            type: types.ACCOUNT_SIGNOUT
        });
    }
}

export function signinAccount(account, key) {
    return (dispatch: () => void) => {
        let payload = {
            account: account,
            key: key,
        };
        dispatch(AccountsActions.addAccount(account, key));
        dispatch({
            type: types.ACCOUNT_SIGNIN,
            payload: payload
        });
        dispatch(fetchAccount(account));
    }
}

export function follow(payload) {
    return (dispatch: () => void) => {
        const wif = payload.account.key;
        const account = payload.account.name;
        const who = payload.who;
        const what = (payload.action === 'follow') ? ['blog'] : [];
        const json = JSON.stringify(['follow', {follower: account, following: who, what: what}]);
        golos.broadcast.customJson(wif, [], [account], 'follow', json, (err, result) => {
            if (payload.action === 'follow') {
                dispatch({
                    type: types.ACCOUNT_FOLLOWING_APPEND,
                    following: [who]
                });
            } else {
                dispatch({
                    type: types.ACCOUNT_FOLLOWING_REMOVE,
                    account: who
                });
            }
        });
    }
}
