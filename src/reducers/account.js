import pull from 'lodash/pull';
import uniq from 'lodash/uniq';

import * as types from '../actions/actionTypes';

import { saveMemoKeyInSession } from '../utils/MessageUtils';

export default function account(state = false, action) {
    switch (action.type) {
        case types.ACCOUNT_FOLLOWING_APPEND: {
            const existingFollowers = state.following || [];
            const following = action.following;
            return Object.assign({}, state, {
                following: uniq(existingFollowers.concat(following)),
            });
        }
        case types.ACCOUNT_FOLLOWING_REMOVE: {
            const existingFollowers = state.following || [];
            return Object.assign({}, state, {
                following: uniq(pull(existingFollowers, action.account)),
            });
        }
        case types.ACCOUNT_FETCH: {
            return Object.assign({}, state, {
                data: action.payload.data,
            });
        }
        case types.ACCOUNT_NOTIFICATIONS_FETCH: {
            return Object.assign({}, state, {
                notifications: action.payload,
            });
        }
        case types.ACCOUNT_SIGNOUT:
            localStorage.setItem('notifyEnabled', '');
            localStorage.setItem('memoKey', '');
            saveMemoKeyInSession('');
            return {
                isUser: false,
                name: '',
                key: '',
                memoKey: '',
            };
        case types.ACCOUNT_SIGNIN:
            localStorage.setItem('notifyEnabled', '1');
            if (action.payload.memoKey)
                localStorage.setItem('memoKey', action.payload.memoKey);
            return Object.assign({}, state, {
                isUser: true,
                name: action.payload.account,
                key: action.payload.key || state.key,
                memoKey: action.payload.memoKey || state.memoKey
            });
        default:
            return state;
    }
}
