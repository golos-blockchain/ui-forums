import pull from 'lodash/pull';
import uniq from 'lodash/uniq';

import * as types from '../actions/actionTypes';

export default function account(state = false, action) {
    switch(action.type) {
        case types.ACCOUNT_FOLLOWING_APPEND: {
            const existingFollowers = state.following || [];
            const following = action.following;
            return Object.assign({}, state, {
                following: uniq(existingFollowers.concat(following))
            });
        }
        case types.ACCOUNT_FOLLOWING_REMOVE: {
            const existingFollowers = state.following || [];
            return Object.assign({}, state, {
                following: uniq(pull(existingFollowers, action.account))
            });
        }
        case types.ACCOUNT_FETCH: {
            return Object.assign({}, state, {
                data: action.payload.data
            });
        }
        case types.ACCOUNT_SIGNOUT:
            return {
                isUser: false,
                name: '',
                key: ''
            };
        case types.ACCOUNT_SIGNIN:
            return Object.assign({}, state, {
                isUser: true,
                name: action.payload.account,
                key: action.payload.key,
            });
        default:
            return state;
    }
}
