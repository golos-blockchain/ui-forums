import { fetchPost, fetchPostResponses } from '../src/actions/postActions';
import post from '../src/reducers/post';

// Server-side state builder which emulates Redux

export async function getState(url) {
    let state = {};

    let parts = url.split('/');
    if (parts.length == 4) {
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
