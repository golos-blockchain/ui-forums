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
    const forums_val = await golos.api.getValue(CONFIG.FORUM.creator, 'g.f.' + CONFIG.FORUM._id);
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
        forum.tags = ['fm-' + CONFIG.FORUM._id, 'fm-' + CONFIG.FORUM._id + '-' + _id]
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
    ctx.body = {
        data: [
            {
        "_id":"kakom-kverhu",
        "author":"lex",
        "title":"Как работать с воркерами? FAQ"
        },{
        "_id":"dermo",
        "author":"lomashuk",
        "title":"Критика вашего блокчейна"
        },{
        "_id":"ya-nadzirayu-za-snezhnim-komom",
        "author":"Роскомнадзор",
        "title":"Я надзираю за снежным комом"
        }
        ], 
        "network": {}, 
        "status": "ok",
        forum: forums_obj[ctx.params.slug],
        children: Object.assign({}, forums_obj[ctx.params.slug].children),
        meta: {'query':{},'sort':{}}
    }
})

app.use(livereload());
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));