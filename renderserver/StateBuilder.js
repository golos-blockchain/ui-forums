import fetch from 'cross-fetch';

import * as CONFIG from '../config';

import * as types from '../src/actions/actionTypes';
import { fetchPost, fetchPostResponses } from '../src/actions/postActions';
import { setBreadcrumb } from '../src/actions/breadcrumbActions';
import post from '../src/reducers/post';
import breadcrumb from '../src/reducers/breadcrumb';

// Server-side state builder which emulates Redux

export async function getState(url) {
    let state = {};

    let parts = url.split('/');
    if (url === '/') {
        let uri = CONFIG.rest_api;
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
        state.breadcrumb = breadcrumb();
        const forumid = parts[2];
        const page = parts[3] || '1';
        let url = `${ CONFIG.rest_api }/forum/${ forumid }?page=${ page }`;
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json()
            if (result.status === 'ok') {
                // and we have data
                if (result.data) {
                    state.children = result.children;
                    state.topics = result.data;
                    let trail = result.forum.trail.map(item => {
                        return {
                            name: item.name_ru,
                            link: `/f/${item._id}`
                        };
                    });
                    state.breadcrumb = breadcrumb(state.breadcrumb, setBreadcrumb(trail));
                }
            }
        }
    } else if (parts.length == 4) {
        state.post = post();
        state.breadcrumb = breadcrumb();
        let params = {category: parts[1], author: parts[2].replace('@', ''), permlink: parts[3]};
        let dispatch = (action) => {
            state.post = post(state.post, action);
            state.breadcrumb = breadcrumb(state.breadcrumb, action);
        };
        await fetchPost(params)(dispatch);
        await fetchPostResponses(params)(dispatch);
    }

    return state;
}
