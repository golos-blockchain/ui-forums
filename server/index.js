const koa = require('koa')
const koaRouter = require('koa-router')
const cors = require('koa-cors');
const livereload = require('koa-livereload');
const golos = require('golos-classic-js');

golos.config.set('websocket', 'wss://api.golos.id/ws');

const app = new koa()
const router = new koaRouter()

let forums = [{
    '_id': 'cats',
    'name': 'Коты',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}, {
    '_id': 'dogs',
    'name': 'Ламантин Консташук',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}, {
    '_id': 'cryptocurrencies',
    'name': 'Криптовалюты',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}, {
    '_id': 'scam-how-to',
    'name': 'Скам. С чего начать',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}, {
    '_id': 'spice-sol-fen',
    'name': 'Как продавать шаурму через блокчейн',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}, {
    '_id': 'fludilka',
    'name': 'Флудилка',
    'creator': 'lex',
    'created': '2020-01-01T10:10:10',
    'created_height': 0,
    'created_tx': 0,
    'expires': '2022-01-01T10:10:10',
    'stats': {'replies' : '100', 'posts' : '500'}
}];

router.get('/', (ctx) => {
    ctx.body = {
        data: {
            'forums': forums,
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

router.get('/forums', (ctx) => {
    ctx.body = {
        data: {
            'forums': forums,
        }, 
        "network": {}, 
        "status": "ok"
    }
})

router.get('/forum/:slug', (ctx) => {
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
        forum: {"_id":"cats","creator":"lex"}, children: [], meta: {'query':{},'sort':{}}
    }
})

app.use(livereload());
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(5000, () => console.log('running on port 5000'));