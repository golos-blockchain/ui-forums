const koa = require('koa')
const koaRouter = require('koa-router')
const cors = require('koa-cors');
const livereload = require('koa-livereload');
const golos = require('golos-classic-js');
const gmailSend = require('gmail-send');
const fs = require('fs');
const atob = require('atob');
const btoa = require('btoa');

const CONFIG = require('../config');
const CONFIG_SEC = require('../configSecure');

golos.config.set('websocket', CONFIG.GOLOS_NODE);

const app = new koa();
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

function getAllTags(tags, forums) {
    if (forums)
    for (let _id in forums) {
        tags.push(idToTag(_id));
        getAllTags(tags, forums[_id].children);
    }
}

async function setForumStats(forums, stats, lastPostNeed = true) {
    if (!stats) return;

    let tags = [];
    getAllTags(tags, forums);
    const data = await golos.api.getAllDiscussionsByActiveAsync(
        '', '', 0, 1,
        tags,
        0, 0
    );

    if (forums)
    for (let [_id, forum] of Object.entries(forums)) {
        forum.stats = stats[_id] || {posts: 0, total_posts: 0, comments: 0, total_comments: 0};

        if (!lastPostNeed) continue;

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

    await setForumStats(vals[NOTE_], vals[NOTE_PST_STATS_LST]);

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

    await setForumStats({[_id]: forum}, vals[NOTE_PST_STATS_LST], false);
    await setForumStats(forum.children, vals[NOTE_PST_STATS_LST]);

    const tag = idToTag(_id);
    const data = await golos.api.getAllDiscussionsByActiveAsync(
        '', '', ctx.query.page ? (ctx.query.page - 1) * CONFIG.FORUM.posts_per_page : 0, CONFIG.FORUM.posts_per_page,
        [tag],
        0, 0
    );

    let filteredData = [];
    const hidden = vals[NOTE_PST_HIDMSG_LST];
    const banned = vals[NOTE_PST_HIDACC_LST];
    for (let post of data[tag]) {
        if (ctx.query.filter !== 'all' && post.net_rshares < CONFIG.MODERATION.hide_threshold) continue;
        post.post_hidden = !!hidden[post.id];
        post.author_banned = !!banned[post.author];
        post.url = getUrl(post.url, _id);

        const replies = await golos.api.getContentRepliesAsync(post.author, post.permlink, 0, 0);
        if (replies.length) {
            const reply = replies[replies.length - 1];
            post.last_reply = reply.created;
            post.last_reply_by = reply.author;
            post.last_reply_url = getUrl(reply.url, _id);
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
    data.donate_list = [];
    data.author_banned = !!vals[NOTE_PST_HIDACC_LST][data.author];
    data.post_hidden = !!vals[NOTE_PST_HIDMSG_LST][data.id];
    data.donate_uia_list = [];
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

    let data = await golos.api.getContentRepliesAsync(ctx.params.author, ctx.params.permlink, DEFAULT_VOTE_LIMIT, 0);
    for (let item of data) {
        item.donate_list = [];
        item.donate_uia_list = [];
        item.url = getUrl(item.url, ctx.params.category);
        item.author_banned = !!vals[NOTE_PST_HIDACC_LST][item.author];
    }
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

getRandomArbitrary = (min, max) => {
    return parseInt(Math.random() * (max - min) + min);
}

router.get('/send_email/:email/:locale/:username/:owner/:active/:posting/:memo', async (ctx) => {
    if (!CONFIG_SEC.gmail_send.user || !CONFIG_SEC.gmail_send.pass)
        return returnError(ctx, 'Mail service is not configured. Admin should configure it like this:<pre>\
            {\n\
                gmail_send: {\n\
                    user: \'vasya.pupkin\',\n\
                    pass: \'gmail application password\'\n\
                }\n\
            }</pre>');

    const veri_code = getRandomArbitrary(1000, 9999);

    let html = CONFIG_SEC.registrar[ctx.params.locale].email_html;
    if (!html.includes('{verification_code}')) {
        return returnError(ctx, 'email_html in config has wrong format. It does not contain <code>{verification_code}</code>. Admin should configure it like this:<pre>email_html: \'Your verification code: <h4>{verification_code}</h4>\'</pre>');
    }
    html = html.replace('{verification_code}', veri_code);
    html = html.replace('{FORUM.link_title}', CONFIG.FORUM[ctx.params.locale].link_title);

    let sbj = CONFIG_SEC.registrar[ctx.params.locale].email_subject;
    sbj = sbj.replace('{FORUM.link_title}', CONFIG.FORUM[ctx.params.locale].link_title);

    const {username, owner, active, posting, memo} = ctx.params;
    let file_obj = {username, owner, active, posting, memo};
    file_obj.code = veri_code;

    fs.writeFileSync('verification_codes/' + btoa(ctx.params.email) + '.txt', JSON.stringify(file_obj));

    const send = gmailSend({
      user: CONFIG_SEC.gmail_send.user,
      pass: CONFIG_SEC.gmail_send.pass,
      from: CONFIG_SEC.registrar.email_sender,
      to: ctx.params.email,
      subject: sbj,
    });

    try {
        const res = await send({
            html
        });
        ctx.body = {
            "data": ctx.params.email,
            "network": {}, 
            "status": "ok"
        }
    } catch (e) {
        console.log(e)
        return returnError(ctx, JSON.stringify(e));
    }
})

router.get('/verify_email/:email/:code', async (ctx) => {
    const path = 'verification_codes/' + btoa(ctx.params.email) + '.txt';
    let file_obj = null;
    try {
        file_obj = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (e) {
        return returnError(ctx, 'Wrong code');
    }
    if (file_obj.code != ctx.params.code) {
        return returnError(ctx, 'Wrong code');
    }

    let aro = undefined;
    if (CONFIG_SEC.registrar.referer) {
        let max_referral_interest_rate;
        let max_referral_term_sec;
        let max_referral_break_fee;
        try {
            const chain_properties = await golos.api.getChainPropertiesAsync();
            max_referral_interest_rate = chain_properties.max_referral_interest_rate;
            max_referral_term_sec = chain_properties.max_referral_term_sec;
            max_referral_break_fee = chain_properties.max_referral_break_fee;
        } catch (error) {
            console.error('Error in verify_email get_chain_properties', error);
        }

        const dgp = await golos.api.getDynamicGlobalPropertiesAsync();
        aro = [[
            0, {
                referrer: CONFIG_SEC.registrar.referer,
                interest_rate: max_referral_interest_rate,
                end_date: new Date(Date.parse(dgp.time) + max_referral_term_sec*1000).toISOString().split(".")[0],
                break_fee: max_referral_break_fee
            }
        ]];
    }
    let accs = null;
    try {
        await golos.broadcast.accountCreateWithDelegationAsync(CONFIG_SEC.registrar.signing_key,
          CONFIG_SEC.registrar.fee, CONFIG_SEC.registrar.delegation,
          CONFIG_SEC.registrar.account, file_obj.username, 
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.owner, 1]]},
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.active, 1]]},
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.posting, 1]]},
            file_obj.memo,
          '{}', aro);
        await new Promise(resolve => setTimeout(resolve, 1000));
        accs = await golos.api.getAccountsAsync([file_obj.username]);
    } catch (err) {
        return returnError(ctx, err)
    }

    if (!accs || !accs.length) {
        return returnError(ctx, 'unknown reason');
    }

    fs.unlinkSync(path);

    ctx.body = {
        "network": {}, 
        "status": "ok"
    }
});

app.use(livereload());
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));
