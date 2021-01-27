import fetch from 'cross-fetch';

import * as CONFIG from '../config';

import { fetchPost, fetchPostResponses } from '../src/actions/postActions';
import post from '../src/reducers/post';

// Server-side state builder which emulates Redux

export async function getState(url) {
    let state = {};

    let parts = url.split('/');
    if (url === '/') {
        let uri = CONFIG.REST_API;
        const response = await fetch(uri);
        if (response.ok) {
            const result = await response.json();
            state.forums = result.data.forums;
            state.moders = result.data.moders;
            state.supers = result.data.supers;
            state.admins = result.data.admins;
            state.users = result.data.users;
        }
    } else if (parts.length >= 3 && parts[1] == 'f') {
        const forumid = parts[2];
        const page = parts[3] || '1';
        let url = `${ CONFIG.REST_API }/forum/${ forumid }?page=${ page }`;
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json()
            if (result.status === 'ok') {
                // and we have data
                if (result.data) {
                    state.children = result.children;
                    state.topics = result.data;
                }
            }
        }
    } else if (parts.length == 4) {
        state.post = post();
        let params = {category: parts[1], author: parts[2].replace('@', ''), permlink: parts[3]};
        let dispatch = (action) => {
            state.post = post(state.post, action);
        };
        await fetchPost(params)(dispatch);
        await fetchPostResponses(params)(dispatch);
    }

    return state;
}
