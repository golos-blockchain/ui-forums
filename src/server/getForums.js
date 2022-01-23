import golos from 'golos-lib-js';

import * as CONFIG from '@/config';

const PREFIX = 'g.f.';
const PREFIX_PST = 'g.pst.f.';

const LST = '.lst';
const ACCS = '.accs';

const GLOBAL_ID = CONFIG.forum._id.toLowerCase();
const NOTE_     = PREFIX + GLOBAL_ID;
const NOTE_PST_ = PREFIX_PST + GLOBAL_ID;
const NOTE_PST_HIDMSG_LST      = NOTE_PST_ + '.hidmsg' + LST;
const NOTE_PST_HIDMSG_LST_ACCS = NOTE_PST_ + '.hidmsg' + LST + ACCS;
const NOTE_PST_HIDACC_LST      = NOTE_PST_ + '.hidacc' + LST;
const NOTE_PST_HIDACC_LST_ACCS = NOTE_PST_ + '.hidacc' + LST + ACCS;
const NOTE_PST_STATS_LST       = NOTE_PST_ + '.stats' + LST;

let getValues = async (keys) => {
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

function getUrl(urlRaw, _id) {
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

function getAllTags(forums, tags, tagIdMap = {}) {
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

function initGolos() {
    if (!process.env.GOLOS_SERVER_NODE)
        throw new Error('Please set GOLOS_SERVER_NODE environment variable in docker-compose.yml (if production) or in package.json (if development). Example: wss://api-full.golos.id/ws');
    golos.config.set('websocket', process.env.GOLOS_SERVER_NODE);
    golos.config.set('chain_id', CONFIG.golos_chain_id);
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
