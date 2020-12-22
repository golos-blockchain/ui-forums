import golos from 'golos-classic-js';

import * as types from './actionTypes';
import * as CONFIG from '../../config';
import * as statusActions from './statusActions';

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
        // setTimeout(function() {
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
        // setTimeout(function() {
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
