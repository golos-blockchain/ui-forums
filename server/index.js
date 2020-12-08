const koa = require('koa')
const koaRouter = require('koa-router')
const cors = require('koa-cors');
const livereload = require('koa-livereload');
const golos = require('golos-classic-js');
const CONFIG = require('../config');

golos.config.set('websocket', CONFIG.GOLOS_NODE);

const app = new koa()
const router = new koaRouter()

let getForums = async function() {
    const global_id = CONFIG.FORUM._id.toLowerCase();
    const forums_val = await golos.api.getValue(CONFIG.FORUM.creator, 'g.f.' + global_id);
    if (forums_val == '') {
        return {};
    }
    let forums_obj = {};
    try {
        forums_obj = JSON.parse(forums_val);
    } catch (ex) {
        return {};
    }
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

router.get('/', async (ctx) => {
    ctx.body = {
        data: {
            'forums': await getForums(),
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
    ctx.body = {
        data: data, 
        "network": {}, 
        "status": "ok",
        forum: forums_obj[forum_id],
        children: Object.assign({}, forums_obj[forum_id].children),
        meta: {'query':{},'sort':{}}
    }
})

const DEFAULT_VOTE_LIMIT = 10000

router.get('/:category/@:author/:permlink', async (ctx) => {
    let forums_obj = await getForums();
    const forum_id = ctx.params.category;
    const data = await golos.api.getContent(ctx.params.author, ctx.params.permlink, DEFAULT_VOTE_LIMIT);
    ctx.body = {
        data: data,
        forum: forums_obj[forum_id],
        "network": {}, 
        "status": "ok"
    }
})

router.get('/:category/@:author/:permlink/responses', async (ctx) => {
    const data = await golos.api.getAllContentReplies(ctx.params.author, ctx.params.permlink, DEFAULT_VOTE_LIMIT);
    ctx.body = {
        data: data,
        "network": {}, 
        "status": "ok"
    }
})

app.use(livereload());
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));