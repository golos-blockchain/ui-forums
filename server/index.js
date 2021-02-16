const koa = require('koa');
const session = require('koa-session');
const koaRouter = require('koa-router');
const compress = require('koa-compress');
const cors = require('koa-cors');
const livereload = require('koa-livereload');
const golos = require('golos-classic-js');

const CONFIG = require('../config');
const CONFIG_SEC = require('../configSecure');

const { useAuthApi } = require('./api/auth');

golos.config.set('websocket', CONFIG.GOLOS_NODE);
if (CONFIG.GOLOS_CHAIN_ID) {
    golos.config.set('chain_id', CONFIG.GOLOS_CHAIN_ID);
}

const app = new koa();

app.use(compress({
    filter(contentType) {
        return true;
    },
    threshold: 2048,
    gzip: {
        flush: require('zlib').constants.Z_SYNC_FLUSH
    },
    deflate: {
        flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    br: false // disable brotli
}));

const router = new koaRouter();

const returnError = (ctx, err) => {
    ctx.body = {
        "data": err,
        "network": {}, 
        "status": "err"
    };
};

const PREFIX = 'g.f.';
const PREFIX_PST = 'g.pst.f.';

const LST = '.lst';
const ACCS = '.accs';

const GLOBAL_ID = CONFIG.FORUM._id.toLowerCase();
const NOTE_     = PREFIX + GLOBAL_ID;
const NOTE_PST_ = PREFIX_PST + GLOBAL_ID;
const NOTE_PST_HIDMSG_LST      = NOTE_PST_ + '.hidmsg' + LST;
const NOTE_PST_HIDMSG_LST_ACCS = NOTE_PST_ + '.hidmsg' + LST + ACCS;
const NOTE_PST_HIDACC_LST      = NOTE_PST_ + '.hidacc' + LST;
const NOTE_PST_HIDACC_LST_ACCS = NOTE_PST_ + '.hidacc' + LST + ACCS;
const NOTE_PST_STATS_LST       = NOTE_PST_ + '.stats' + LST;

let getValues = async (keys) => {
    let vals = await golos.api.getValuesAsync(CONFIG.FORUM.creator, Object.keys(keys));
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

function findForum(vals, forum_id, trail = []) {
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
        if (inChild) return inChild;
    }
    return null;
}

function getUrl(urlRaw, _id) {
    return '/' + _id + urlRaw.substring(('/' + idToTag(_id)).length);
}

async function getLastActivity(data, lastPosts, lastReplies, _id, forum, isRootCall = true) {
    const tag = idToTag(_id);
    if (data[tag] && data[tag].length) {
        let lastPost = data[tag][0];
        lastPost.url = getUrl(lastPost.url, _id);
        lastPosts.push(lastPost);
        lastPost.last_reply = lastPost.last_reply || {};
        lastPost.last_reply.title = lastPost.title;
        lastPost.last_reply.url = '/' + _id + '/@' + lastPost.author + '/' + lastPost.permlink + '#@' + lastPost.last_reply.author + '/' + lastPost.last_reply.permlink;
        if (lastPost.last_reply.author) lastReplies.push(lastPost.last_reply);
    }
    if (forum.children) {
        for (let [_id2, forum2] of Object.entries(forum.children)) {
            await getLastActivity(data, lastPosts, lastReplies, _id2, forum2, false);
        }
    }
    if (isRootCall) {
        lastPosts.sort((a, b) => a.created < b.created);
        lastReplies.sort((a, b) => a.created < b.created);
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
        forum.last_post = lastPosts[0];
        forum.last_reply = lastReplies[0];
    }
}

router.get('/', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    keys[NOTE_PST_STATS_LST] = Object;

    let vals = await getValues(keys);

    await setForumStats(vals[NOTE_], vals[NOTE_PST_STATS_LST], vals[NOTE_PST_HIDMSG_LST], vals[NOTE_PST_HIDACC_LST]);

    ctx.body = {
        data: {
            'forums': vals[NOTE_],
            'moders': vals[NOTE_PST_HIDMSG_LST_ACCS],
            'supers': vals[NOTE_PST_HIDACC_LST_ACCS],
            'admins': [],
            'stats': vals[NOTE_PST_STATS_LST],
            'users': {
                'stats': {
                    'total': 1,
                    'app': 0,
                },
                'list': []
            }
        }, 
        "network": {}, 
        "status": "ok"
    }
});

router.get('/forums', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    const vals = await getValues(keys);
    ctx.body = {
        data: {
            'forums': vals[NOTE_],
        }, 
        "network": {}, 
        "status": "ok"
    }
});

router.get('/forum/:slug', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    keys[NOTE_PST_STATS_LST] = Object;

    const vals = await getValues(keys);

    const forum_id = ctx.params.slug;
    let {_id, forum} = findForum(vals[NOTE_], forum_id);

    await setForumStats({[_id]: forum, ...forum.children}, vals[NOTE_PST_STATS_LST], vals[NOTE_PST_HIDMSG_LST], vals[NOTE_PST_HIDACC_LST]);

    const tag = idToTag(_id);
    const data = await golos.api.getAllDiscussionsByActiveAsync(
        '', '', ctx.query.page ? (ctx.query.page - 1) * CONFIG.FORUM.posts_per_page : 0, CONFIG.FORUM.posts_per_page,
        [tag],
        0, 0
    );

    let filteredData = [];
    const hidden = vals[NOTE_PST_HIDMSG_LST];
    const banned = vals[NOTE_PST_HIDACC_LST];
    for (let post of data[tag] || []) {
        if (ctx.query.filter !== 'all' && post.net_rshares < CONFIG.MODERATION.hide_threshold) continue;
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

    ctx.body = {
        data: filteredData, 
        "network": {}, 
        "status": "ok",
        forum: forum,
        children: forum ? Object.assign({}, forum.children) : null,
        moders: vals[NOTE_PST_HIDMSG_LST_ACCS],
        supers: vals[NOTE_PST_HIDACC_LST_ACCS],
        admins: [],
        hidden: hidden,
        banned: banned,
        meta: {'query':{},'sort':{}}
    }
})

const DEFAULT_VOTE_LIMIT = 10000

async function fillDonates(post, bannedAccs) {
    const { author, permlink } = post;
    post.donate_list = await golos.api.getDonatesAsync(false, {author, permlink}, '', '', 200, 0, false);
    for (let item of post.donate_list) {
        item.from_banned = !!bannedAccs[item.from];
    }
    post.donate_uia_list = await golos.api.getDonatesAsync(true, {author, permlink}, '', '', 200, 0, false);
    for (let item of post.donate_uia_list) {
        item.from_banned = !!bannedAccs[item.from];
    }
}

async function fillDonatesBatch(data, targets, bannedAccs) {
    const results = await golos.api.getDonatesForTargetsAsync(targets, 200, 0, false);;
    for (let i = 0; i < results.length; i += 2) {
        const post = data[i / 2];
        if (!post) break;
        post.donate_list = results[i];
        for (let item of post.donate_list) {
            item.from_banned = !!bannedAccs[item.from];
        }
        post.donate_uia_list = results[i + 1];
        for (let item of post.donate_uia_list) {
            item.from_banned = !!bannedAccs[item.from];
        }
    }
}

router.get('/:category/@:author/:permlink', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    const vals = await getValues(keys);

    let { _id, forum } = findForum(vals[NOTE_], ctx.params.category);

    let data = await golos.api.getContentAsync(ctx.params.author, ctx.params.permlink, CONFIG.FORUM.votes_per_page, 0);
    data.url = getUrl(data.url, _id);
    await fillDonates(data, vals[NOTE_PST_HIDACC_LST]);
    data.author_banned = !!vals[NOTE_PST_HIDACC_LST][data.author];
    data.post_hidden = !!vals[NOTE_PST_HIDMSG_LST][data.id];
    forum.moders = vals[NOTE_PST_HIDMSG_LST_ACCS];
    forum.supers = vals[NOTE_PST_HIDACC_LST_ACCS];
    forum.admins = [];
    forum.banned = vals[NOTE_PST_HIDACC_LST];
    ctx.body = {
        data: data,
        forum: forum,
        "network": {}, 
        "status": "ok"
    }
})

router.get('/:category/@:author/:permlink/responses', async (ctx) => {
    let keys = {};
    keys[NOTE_PST_HIDACC_LST] = Object;
    const vals = await getValues(keys);

    targets = [];

    let data = await golos.api.getAllContentRepliesAsync(ctx.params.author, ctx.params.permlink, CONFIG.FORUM.votes_per_page, 0, [], [], false, 'false');
    for (let item of data) {
        item.url = getUrl(item.url, ctx.params.category);
        item.author_banned = !!vals[NOTE_PST_HIDACC_LST][item.author];
        let body = item.body;
        let firstSpace = body.indexOf(' ');
        let firstWord = body.substring(0, firstSpace);
        if (firstWord) {
            let after = body.substring(firstSpace);
            if (!firstWord.startsWith('[@')) {
                let replyAuthor = '';
                if (item.depth > 1) replyAuthor = '[@' + item.parent_author + '](#@' + item.parent_author + '/' +  item.parent_permlink + '), ';
                if (firstWord.startsWith('@')) {
                    item.body = replyAuthor + `${after}`;
                } else {
                    item.body = replyAuthor + `${firstWord}${after}`;
                }
            }
        }
        targets.push({ author: item.author, permlink: item.permlink });
    }
    await fillDonatesBatch(data, targets, vals[NOTE_PST_HIDACC_LST]);
    ctx.body = {
        data: data,
        "network": {}, 
        "status": "ok"
    }
})

router.get('/:category/@:author/:permlink/donates', async (ctx) => {
    let keys = {};
    keys[NOTE_PST_HIDACC_LST] = Object;
    const vals = await getValues(keys);

    let donate_list = await golos.api.getDonatesAsync(false, {author: ctx.params.author, permlink: ctx.params.permlink}, '', '', 200, 0, false);
    for (let item of donate_list) {
        item.from_banned = !!vals[NOTE_PST_HIDACC_LST][item.from];
    }
    let donate_uia_list = await golos.api.getDonatesAsync(true, {author: ctx.params.author, permlink: ctx.params.permlink}, '', '', 200, 0, false);
    for (let item of donate_uia_list) {
        item.from_banned = !!vals[NOTE_PST_HIDACC_LST][item.from];
    }
    ctx.body = {
        data: {donate_list, donate_uia_list},
        "network": {}, 
        "status": "ok"
    }
})

router.get('/@:author', async (ctx) => {
    let keys = {};
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    const vals = await getValues(keys);

    let data = await golos.api.getAccountsAsync([ctx.params.author]);
    ctx.body = {
        data: data[0],
        moders: vals[NOTE_PST_HIDMSG_LST_ACCS],
        supers: vals[NOTE_PST_HIDACC_LST_ACCS],
        banned: vals[NOTE_PST_HIDACC_LST],
        "network": {}, 
        "status": "ok"
    }
})

router.get('/@:author/posts', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDMSG_LST_ACCS] = Array;
    keys[NOTE_PST_HIDACC_LST] = Object;
    keys[NOTE_PST_HIDACC_LST_ACCS] = Array;

    let vals = await getValues(keys);

    const hidden = vals[NOTE_PST_HIDMSG_LST];
    const banned = vals[NOTE_PST_HIDACC_LST];

    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let data = await golos.api.getDiscussionsByBlogAsync({
        select_authors: [ctx.params.author],
        limit: 100
    });
    let posts = [];
    for (let post of data) {
        const tag = post.url.split('/')[1];
        const _id = tagIdMap[tag];
        if (!_id) continue;
        post.url = getUrl(post.url, _id);
        post.forum = findForum(vals[NOTE_], _id); // for moderation
        post.post_hidden = !!hidden[post.id];
        post.author_banned = !!banned[post.author];
        posts.push(post);
    }
    ctx.body = {
        data: {
            total: posts.length,
            posts,
            moders: vals[NOTE_PST_HIDMSG_LST_ACCS],
            supers: vals[NOTE_PST_HIDACC_LST_ACCS],
            admins: [],
            hidden,
            banned,
        },
        "network": {}, 
        "status": "ok"
    }
})

router.get('/@:author/responses', async (ctx) => {
    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDMSG_LST] = Object;
    keys[NOTE_PST_HIDACC_LST] = Object;

    let vals = await getValues(keys);

    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let data = await golos.api.getRepliesByLastUpdateAsync(
        ctx.params.author,
        '', 100,
        0, 0
    );
    let posts = [];
    for (let post of data) {
        const tag = post.url.split('/')[1];
        const _id = tagIdMap[tag];
        if (!_id) continue;
        post.url = getUrl(post.url, _id);
        posts.push({parent: {depth: 0}, reply: post});
    }
    ctx.body = {
        data: {
            total: posts.length,
            responses: posts
        },
        "network": {}, 
        "status": "ok"
    }
})

router.get('/@:author/donates/:direction', async (ctx) => {
    const direction = ctx.params.direction;

    if (direction !== 'from' && direction !== 'to') {
        return returnError(ctx, 'direction should be \'from\' or \'to\'');
    }

    let keys = {};
    keys[NOTE_] = Object;
    keys[NOTE_PST_HIDACC_LST] = Object;

    let vals = await getValues(keys);

    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let donates = await golos.api.getAccountHistoryAsync(ctx.params.author, -1, 1000, {
        select_ops: ['donate_operation'],
        direction: direction === 'from' ? 'sender' : 'receiver'
    });

    const banned = vals[NOTE_PST_HIDACC_LST];

    donates = donates.filter((op) => {
        let item = op[1].op[1];
        op[1].from_banned = !!banned[item.from];
        op[1].to_banned = !!banned[item.to];
        const { author, permlink, _category, _root_author } = item.memo.target;
        if (author && permlink) {
            if (!_category) return false; // Not version 2+ which is used on chainBB 
            const _id = tagIdMap[_category];
            if (!_id) return false; // Not from this chain BB forum
            op[1]._category = _id;
            op[1].author_banned = !!banned[author];
            op[1].root_author_banned = !!banned[_root_author];
        } else {
            return false;
        }
        return true;
    });

    const total = donates.length;

    const start = ctx.query.page ? (ctx.query.page - 1) * CONFIG.FORUM.account_donates_per_page : 0;
    const end = start + CONFIG.FORUM.account_donates_per_page;
    donates = donates.slice(start, end);

    ctx.body = {
        data: {
            donates,
            total
        },
        "network": {}, 
        "status": "ok"
    }
})

app.use(livereload());
app.use(cors({ credentials: true }));
app.keys = ['your-session-secret'];
app.use(session({}, app));
app.use(router.routes());
app.use(router.allowedMethods());

useAuthApi(app);

app.listen(5000, () => console.log('running on port 5000'));
