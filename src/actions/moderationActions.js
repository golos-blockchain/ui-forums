import golos from 'golos-lib-js';

import * as types from '@/actions/actionTypes';
import * as ForumActions from '@/actions/forumActions';

function setValue(wif, isPosting, account, key, value, callback) {
    golos.broadcast.customJson(wif,
        !isPosting ? [account] : [], isPosting ? [account] : [],
        'account_notes', JSON.stringify(['set_value', {
            account,
            key: key,
            value: JSON.stringify(value)
        }]),
        callback);
}

function hidmsg(wif, account, objWithMsg, callback) {
    setValue(wif, true, account,
        'g.pst.f.' + $GLS_Config.forum._id.toLowerCase() + '.hidmsg.lst',
        objWithMsg, callback);
}

function hidacc(wif, account, objWithAcc, callback) {
    setValue(wif, true, account,
        'g.pst.f.' + $GLS_Config.forum._id.toLowerCase() + '.hidacc.lst',
        objWithAcc, callback);
}

export function moderatorHidePostForum(wif, moderator, post, _id, forum, why = '', callback = null) {
    return dispatch => {
        const { name } = moderator;
        let obj = {};
        obj[post.id] = why + '|' + name + '|' + parseInt(Date.now() / 1000);
        dispatch({
            type: types.MODERATION_HIDE_PROCESSING,
            payload: {moderator, post},
            loading: true
        });
        hidmsg(wif, name, obj, (err, result) =>  {
            if (err) {
                dispatch({
                    type: types.MODERATION_HIDE_RESOLVED_ERROR,
                    payload: {moderator, post, err},
                    loading: false
                });
            } else {
                if (callback) callback()
                ForumActions.updateForumStats(wif, name, _id, forum,
                    -1,
                    0)
                dispatch({
                    type: types.MODERATION_HIDE_RESOLVED,
                    payload: {moderator, post},
                    loading: false
                });
            }
        });
    };
}

export function moderatorRevealPostForum(wif, moderator, post, _id, forum, callback = null) {
    return dispatch => {
        const { name } = moderator;
        let obj = {};
        obj[post.id] = null;
        dispatch({
            type: types.MODERATION_REVEAL_PROCESSING,
            payload: {moderator, post},
            loading: true
        });
        hidmsg(wif, name, obj, (err, result) =>  {
            if (err) {
                dispatch({
                    type: types.MODERATION_REVEAL_RESOLVED_ERROR,
                    payload: {moderator, post, err},
                    loading: false
                });
            } else {
                if (callback) callback()
                ForumActions.updateForumStats(wif, name, _id, forum,
                    1,
                    0)
                dispatch({
                    type: types.MODERATION_REVEAL_RESOLVED,
                    payload: {moderator, post},
                    loading: false
                });
            }
        });
    };
}

export function moderatorBanAccount(wif, moderator, accountName, why = '', callback = null) {
    return dispatch => {
        const { name } = moderator;
        let obj = {};
        obj[accountName] = why + '|' + name + '|' + parseInt(Date.now() / 1000);
        dispatch({
            type: types.MODERATION_BAN_PROCESSING,
            payload: {moderator, accountName},
            loading: true
        });
        hidacc(wif, name, obj, (err, result) =>  {
            if (err) {
                dispatch({
                    type: types.MODERATION_BAN_RESOLVED_ERROR,
                    payload: {moderator, accountName, err},
                    loading: false
                });
            } else {
                dispatch({
                    type: types.MODERATION_BAN_RESOLVED,
                    payload: {moderator, accountName},
                    loading: false
                });
                if (callback) callback()
            }
        });
    };
}

export function moderatorUnBanAccount(wif, moderator, accountName, callback = null) {
    return dispatch => {
        const { name } = moderator;
        let obj = {};
        obj[accountName] = null;
        dispatch({
            type: types.MODERATION_UNBAN_PROCESSING,
            payload: {moderator, accountName},
            loading: true
        });
        hidacc(wif, name, obj, (err, result) =>  {
            if (err) {
                dispatch({
                    type: types.MODERATION_UNBAN_RESOLVED_ERROR,
                    payload: {moderator, accountName, err},
                    loading: false
                });
            } else {
                dispatch({
                    type: types.MODERATION_UNBAN_RESOLVED,
                    payload: {moderator, accountName},
                    loading: false
                });
                if (callback) {
                    callback()
                }
            }
        });
    };
}
