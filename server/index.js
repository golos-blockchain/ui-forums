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

const app = new koa()
const router = new koaRouter()

const returnError = (ctx, err) => {
    ctx.body = {
        "data": err,
        "network": {}, 
        "status": "err"
    }
};

let _getValueJson = async function(key, fallback) {
    const val = await golos.api.getValue(CONFIG.FORUM.creator, key);
    if (val == '') return fallback;
    try {
        return JSON.parse(val);
    } catch (ex) {
        return fallback;
    }
};

let getValueArray = async function(key) {
    return await _getValueJson(key, []);
};

let getValueList = async function(key) {
    return await _getValueJson(key, {});
};

let getForums = async function() {
    const global_id = CONFIG.FORUM._id.toLowerCase();
    const forums_obj = await getValueList('g.f.' + global_id);
    for (let [_id, forum] of Object.entries(forums_obj)) {
        forum._id = _id;
        forum.creator = CONFIG.FORUM.creator;
        forum.created = '2020-01-01T10:10:10';
        forum.created_height = 0;
        forum.created_tx = 0;
        forum.expires =  '2022-01-01T10:10:10';
        forum.stats = {'replies' : '0', 'posts' : '0'}
        forum.tags = ['fm-' + global_id + '-' + _id.toLowerCase(), 'fm-' + global_id]
    }
    return forums_obj;
};

let getModers = async function() {
    return await getValueArray('g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidmsg.lst.accs');
};

let getSupers = async function() {
    return await getValueArray('g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidacc.lst.accs');
};

let getAdmins = async function() {
    return await getValueArray('g.f.' + CONFIG.FORUM._id.toLowerCase() + '.banacc.lst.accs');
};

let getHiddenPosts = async function() {
    return await getValueList('g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidmsg.lst');
};

router.get('/', async (ctx) => {
    ctx.body = {
        data: {
            'forums': await getForums(),
            'moders': await getModers(),
            'hhh': await getHiddenPosts(),
            'supers': await getSupers(),
            'admins': [],
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
})

router.get('/forums', async (ctx) => {
    ctx.body = {
        data: {
            'forums': await getForums(),
        }, 
        "network": {}, 
        "status": "ok"
    }
})

router.get('/forum/:slug', async (ctx) => {
    let forums_obj = await getForums();
    const global_id = CONFIG.FORUM._id.toLowerCase();
    const forum_id = ctx.params.slug;
    const data = await golos.api.getAllDiscussionsByActive(
        '', '', 10000000,
        "fm-" + global_id + "-" + forum_id.toLowerCase(),
        0, 20
    );
    const hidden = await getHiddenPosts();
    for (let post of data) {
        post.hidden = !!hidden[post.id];
    }
    ctx.body = {
        data: data, 
        "network": {}, 
        "status": "ok",
        forum: forums_obj[forum_id],
        children: Object.assign({}, forums_obj[forum_id].children),
        moders: await getModers(),
        supers: await getSupers(),
        admins: [],
        hidden: hidden,
        meta: {'query':{},'sort':{}}
    }
})

const DEFAULT_VOTE_LIMIT = 10000

router.get('/:category/@:author/:permlink', async (ctx) => {
    let forums_obj = await getForums();
    const forum_id = ctx.params.category;
    let data = await golos.api.getContent(ctx.params.author, ctx.params.permlink, DEFAULT_VOTE_LIMIT);
    data.donate_list = [];
    data.donate_uia_list = [];
    ctx.body = {
        data: data,
        forum: forums_obj[forum_id],
        "network": {}, 
        "status": "ok"
    }
})

router.get('/:category/@:author/:permlink/responses', async (ctx) => {
    let data = await golos.api.getAllContentReplies(ctx.params.author, ctx.params.permlink, DEFAULT_VOTE_LIMIT);
    for (let item of data) {
        item.donate_list = [];
        item.donate_uia_list = [];
    }
    ctx.body = {
        data: data,
        "network": {}, 
        "status": "ok"
    }
})

router.get('/:category/@:author/:permlink/donates', async (ctx) => {
    const donate_list = await golos.api.getDonates(false, {author: ctx.params.author, permlink: ctx.params.permlink}, '', '', 200, 0, false);
    const donate_uia_list = await golos.api.getDonates(true, {author: ctx.params.author, permlink: ctx.params.permlink}, '', '', 200, 0, false);
    ctx.body = {
        data: {donate_list, donate_uia_list},
        "network": {}, 
        "status": "ok"
    }
})

router.get('/@:author', async (ctx) => {
    const data = await golos.api.getAccounts([ctx.params.author]);
    ctx.body = {
        data: data[0],
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
    html = html.replace('{FORUM.logo_title}', CONFIG.FORUM[ctx.params.locale].logo_title);

    let sbj = CONFIG_SEC.registrar[ctx.params.locale].email_subject;
    sbj = sbj.replace('{FORUM.logo_title}', CONFIG.FORUM[ctx.params.locale].logo_title);

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

    let accs = null;
    try {
        await golos.broadcast.accountCreateWithDelegation(CONFIG_SEC.registrar.signing_key,
          CONFIG_SEC.registrar.fee, CONFIG_SEC.registrar.delegation,
          CONFIG_SEC.registrar.account, file_obj.username, 
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.owner, 1]]},
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.active, 1]]},
            {weight_threshold: 1, account_auths: [], key_auths: [[file_obj.posting, 1]]},
            file_obj.memo,
          '{}', []);
        accs = await golos.api.getAccounts([file_obj.username]);
    } catch (err) {
        return returnError(err)
    }

    if (!accs || !accs.length) {
        return returnError('unknown reason');
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