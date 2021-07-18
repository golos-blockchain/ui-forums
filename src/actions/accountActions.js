import golos from 'golos-classic-js';

import * as types from './actionTypes';
import * as AccountsActions from './accountsActions';
import * as chainstateActions from './chainstateActions';

import importNoty from '../utils/importNoty';
import { getNotifications, markNotificationRead } from '../utils/NotifyApiClient';

export function claimRewards(params) {
    return dispatch => {
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
        }, async (err, result) => {
            dispatch(chainstateActions.getAccounts([name]));
            let Noty = await importNoty();
            if (Noty) new Noty({
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

export function fetchAccountNotifications(account) {
    return async dispatch => {
        if (account) {
            try {
                const result = await getNotifications(account);
                dispatch({
                    type: types.ACCOUNT_NOTIFICATIONS_FETCH,
                    payload: {
                        all: result.counters.total,
                        message: result.counters.message,
                    },
                });
            } catch (error) {
                console.error(error, 'getNotifications');
            }
        }
    }
}

export function clearAccountNotifications(account) {
    return async dispatch => {
        if (account) {
            try {
                await markNotificationRead(account, 'message');
            } catch (error) {
                console.error(error, 'markNotificationRead');
            }
        }
    }
}

export function fetchAccountFollowing(name, start='', limit=100) {
    return dispatch => {
        golos.api.getFollowing(name, start, 'blog', limit, (err, result) => {
            if (!result) return;
            const accounts = result.map((c) => { return c.following });
            if (result.length === limit) {
                const last = result[result.length-1].following;
                setTimeout(() => {
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
    return dispatch => {
        dispatch(AccountsActions.removeAccounts());
        dispatch({
            type: types.ACCOUNT_SIGNOUT
        });
    }
}

export function signinAccount(account, key, memoKey, rememberMe = true) {
    return dispatch => {
        if (!rememberMe && memoKey) { // currently supported memo only
            window.memoKey = memoKey;
        } else {
            let payload = {
                account: account,
                key: key,
                memoKey: memoKey,
            };
            dispatch(AccountsActions.addAccount(account, key));
            dispatch({
                type: types.ACCOUNT_SIGNIN,
                payload: payload
            });
        }
        dispatch(fetchAccount(account));
    }
}

export function follow(payload) {
    return dispatch => {
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
