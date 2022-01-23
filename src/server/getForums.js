import golos from 'golos-lib-js';

import * as CONFIG from '@/config';
import { initGolos } from '@/server/initGolos'

const PREFIX = 'g.f.';
const PREFIX_PST = 'g.pst.f.';

const LST = '.lst';
const ACCS = '.accs';

export const GLOBAL_ID = CONFIG.forum._id.toLowerCase();
export const NOTE_     = PREFIX + GLOBAL_ID;
export const NOTE_PST_ = PREFIX_PST + GLOBAL_ID;
export const NOTE_PST_HIDMSG_LST      = NOTE_PST_ + '.hidmsg' + LST;
export const NOTE_PST_HIDMSG_LST_ACCS = NOTE_PST_ + '.hidmsg' + LST + ACCS;
export const NOTE_PST_HIDACC_LST      = NOTE_PST_ + '.hidacc' + LST;
export const NOTE_PST_HIDACC_LST_ACCS = NOTE_PST_ + '.hidacc' + LST + ACCS;
export const NOTE_PST_STATS_LST       = NOTE_PST_ + '.stats' + LST;

export let getValues = async (keys) => {
    let vals = await golos.api.getValuesAsync(CONFIG.forum.creator, Object.keys(keys));
    for (let [key, type] of Object.entries(keys)) {
        const fallback = (type == Object) ? {} : [];
        if (!vals[key]) {
            vals[key] = fallback;
            continue;
        }
        try {
            vals[key] = JSON.parse(vals[key]);
        } catch (ex) {
            vals[key] = fallback;
        }
    }
    return vals;
};

function idToTag(_id) {
    return 'fm-' + GLOBAL_ID + '-' + _id.toLowerCase();
}

export function findForum(vals, forum_id, trail = []) {
    for (let [_id, forum] of Object.entries(vals)) {
        if (_id.toLowerCase() === forum_id.toLowerCase()) {
            forum._id = _id; // for moderation, PostForm
            forum.creator = 'cyberfounder';
            forum.tags = [idToTag(_id), 'fm-' + GLOBAL_ID];
            forum.trail = [...trail, {
                _id,
                name: forum.name,
                name_ru: forum.name_ru
            }];
            return {_id, forum};
        }
        if (!forum.children) continue;
        let inChild = findForum(forum.children, forum_id, [...trail, {
            _id,
            name: forum.name,
            name_ru: forum.name_ru
        }]);
        if (inChild.forum) return inChild;
    }
    return {_id: null, forum: null};
}

export function getUrl(urlRaw, _id) {
    return '/' + _id + urlRaw.substring(('/' + idToTag(_id)).length);
}

async function getLastActivity(data, lastPosts, lastReplies, _id, forum, isRootCall = true) {
    const tag = idToTag(_id);
    if (data[tag] && data[tag].length) {
        let lastPost = data[tag][0];
        lastPosts.push(lastPost);
        if (lastPost.url.startsWith('/fm-')) {
            lastPost.url = getUrl(lastPost.url, _id);
            lastPost.last_reply = lastPost.last_reply || {};
            lastPost.last_reply.title = lastPost.title;
            lastPost.last_reply.url = '/' + _id + '/@' + lastPost.author + '/' + lastPost.permlink + '#@' + lastPost.last_reply.author + '/' + lastPost.last_reply.permlink;
        }
        if (lastPost.last_reply.author) lastReplies.push(lastPost.last_reply);
    }
    if (forum.children) {
        for (let [_id2, forum2] of Object.entries(forum.children)) {
            await getLastActivity(data, lastPosts, lastReplies, _id2, forum2, false);
        }
    }
    if (isRootCall) {
        const sortByCreated = (a, b) => {
            return b.created < a.created ? -1 : (b.created > a.created ? 1 : 0);
        };
        lastPosts.sort(sortByCreated);
        lastReplies.sort(sortByCreated);
    }
}

export function getAllTags(forums, tags, tagIdMap = {}) {
    if (forums)
    for (let _id in forums) {
        const tag = idToTag(_id);
        tags.push(tag);
        tagIdMap[tag] = _id;
        getAllTags(forums[_id].children, tags, tagIdMap);
    }
}

async function setForumStats(forums, stats, hidden, banned) {
    if (!stats) return;

    let tags = [];
    getAllTags(forums, tags);
    const data = await golos.api.getAllDiscussionsByActiveAsync(
        '', '', 0, 1,
        tags,
        0, 0,
        Object.keys(hidden), Object.keys(banned)
    );

    if (forums)
    for (let [_id, forum] of Object.entries(forums)) {
        forum.stats = stats[_id] || {posts: 0, total_posts: 0, comments: 0, total_comments: 0};

        let lastPosts = [];
        let lastReplies = [];
        await getLastActivity(data, lastPosts, lastReplies, _id, forum);
        forum.last_post = lastPosts[0] || null;
        forum.last_reply = lastReplies[0] || null;
    }
}

export async function getForums() {
    initGolos()

    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    keys[NOTE_PST_STATS_LST] = Object;

    let vals = await getValues(keys);

    await setForumStats(vals[NOTE_], vals[NOTE_PST_STATS_LST], vals[NOTE_PST_HIDMSG_LST], vals[NOTE_PST_HIDACC_LST]);

    let ret = {
        'forums': vals[NOTE_],
        'moders': vals[NOTE_PST_HIDMSG_LST_ACCS],
        'supers': vals[NOTE_PST_HIDACC_LST_ACCS],
        'admins': [],
        'stats': vals[NOTE_PST_STATS_LST],
    }
    return ret
}

export async function getForum(forum_id, page = 0, filter = '') {
    initGolos()

    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    keys[NOTE_PST_STATS_LST] = Object;

    const vals = await getValues(keys);

    let {_id, forum} = findForum(vals[NOTE_], forum_id);
    if (!forum) {
        console.error('404: cannot find forum', forum_id)
        return {
            data: [],
            childForums: {},
            forum: null,
        }
    }

    await setForumStats({[_id]: forum, ...forum.children}, vals[NOTE_PST_STATS_LST], vals[NOTE_PST_HIDMSG_LST], vals[NOTE_PST_HIDACC_LST]);

    const tag = idToTag(_id);
    const data = await golos.api.getAllDiscussionsByActiveAsync(
        '', '', page ? (page - 1) * CONFIG.forum.posts_per_page : 0, CONFIG.forum.posts_per_page,
        [tag],
        0, 0
    );

    let filteredData = [];
    const hidden = vals[NOTE_PST_HIDMSG_LST];
    const banned = vals[NOTE_PST_HIDACC_LST];
    for (let post of data[tag] || []) {
        if (filter !== 'all' && post.net_rshares < -9999999999) continue;
        post.post_hidden = !!hidden[post.id];
        post.author_banned = !!banned[post.author];
        post.url = getUrl(post.url, _id);

        if (post.last_reply) {
            const reply = post.last_reply;
            post.last_reply = reply.created;
            post.last_reply_by = reply.author;
            post.last_reply_url = '/' + _id + '/@' + post.author + '/' + post.permlink + '#@' + reply.author + '/' + reply.permlink;
        } else {
            post.last_reply = post.created;
            post.last_reply_by = post.author;
            post.last_reply_url = post.url;
        }
        filteredData.push(post);
    }

    let ret = {
        data: filteredData, 
        "network": {}, 
        "status": "ok",
        forum: forum,
        childForums: forum ? Object.assign({}, forum.children) : null,
        moders: vals[NOTE_PST_HIDMSG_LST_ACCS],
        supers: vals[NOTE_PST_HIDACC_LST_ACCS],
        admins: [],
        hidden: hidden,
        banned: banned,
    }
    return ret
}
