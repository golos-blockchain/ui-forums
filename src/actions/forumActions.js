import golos from 'golos-classic-js';

import * as types from './actionTypes';
import * as CONFIG from '../../config';

export function forumReservation(account, name, namespace) {
    return (dispatch: () => void) => {
        const id = 'chainbb';
        let json = ['forum_reserve'];
        json.push({
            name,
            namespace,
        });
        dispatch({
            type: types.FORUM_RESERVATION_PROCESSING,
            payload: json,
        });
        // setTimeout(() => {
        //         dispatch({
        //             type: types.FORUM_RESERVATION_RESOLVED,
        //             payload: json,
        //         })
        // }, 2000)
        golos.broadcast.customJson(account.key, [], [account.name], id, JSON.stringify(json), (err, result) => {
            if (result) {
                dispatch({
                    type: types.FORUM_RESERVATION_RESOLVED,
                    payload: json,
                });
            }
            if (err) {
                dispatch({
                    type: types.FORUM_RESERVATION_RESOLVED_ERROR,
                    payload: json,
                });
            }
        });
    };
}

export function forumConfig(account, namespace, settings) {
    return (dispatch: () => void) => {
        const id = 'chainbb';
        let json = ['forum_config'];
        json.push({
            namespace,
            settings,
        });
        dispatch({
            type: types.FORUM_CONFIG_PROCESSING,
            payload: json,
        });
        // setTimeout(() => {
        //     dispatch({
        //         type: types.FORUM_CONFIG_RESOLVED,
        //         payload: json,
        //     })
        // }, 2000)
        golos.broadcast.customJson(account.key, [], [account.name], id, JSON.stringify(json), (err, result) => {
            if (result) {
                dispatch({
                    type: types.FORUM_CONFIG_RESOLVED,
                    payload: json,
                });
            }
            if (err) {
                dispatch({
                    type: types.FORUM_CONFIG_RESOLVED_ERROR,
                    payload: json,
                });
            }
        });
    };
}

export function setForum(forum) {
    return (dispatch: () => void) => {
        dispatch({
            type: types.FORUM_LOAD_RESOLVED,
            payload: {forum},
        });
    };
}

export function fetchForumDetails(ns) {
    return (dispatch: () => void) => {
        /*axios.get(`${ CONFIG.REST_API }/status/${ns}`)
            .then(response => {
                dispatch(statusActions.setStatus(response.data))
                dispatch({
                    type: types.FORUM_LOAD_RESOLVED,
                    payload: response.data,
                })
            })
            .catch((error) => {
                console.log(error);
            })*/
    };
}

export async function updateForumStats(wif, account, _id, forum, addPosts, addComments, addTotalPosts = 0, addTotalComments = 0) {
    try {
        const key = 'g.pst.f.' + CONFIG.FORUM._id.toLowerCase() + '.stats.lst';

        let vals = await golos.api.getValuesAsync(CONFIG.FORUM.creator, [key]);
        vals[key] = vals[key] ? JSON.parse(vals[key]) : {};

        let operations = [];
        for (let item of forum.trail) {
            let stat = vals[key][item._id] || {posts: 0, total_posts: 0, comments: 0, total_comments: 0};
            stat.posts += addPosts;
            stat.comments += addComments;
            stat.total_posts += addTotalPosts;
            stat.total_comments += addTotalComments;

            let json = JSON.stringify(['set_value', {
                account,
                key,
                value: JSON.stringify({[item._id]: stat})
            }]);
            operations.push(['custom_json', {
                required_auths: [],
                required_posting_auths: [account],
                id: 'account_notes',
                json
            }]);
        }

        await golos.broadcast.sendAsync({
            operations,
            extensions: []
        }, [wif]);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
