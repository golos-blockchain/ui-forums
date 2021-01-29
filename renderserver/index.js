import App from '../src/containers/app.js';
const koa = require('koa');
const koaRouter = require('koa-router');
const cors = require('koa-cors');
const livereload = require('koa-livereload');
const path = require('path');
const fs = require('fs');
import React from 'react';
const ReactDOMServer = require('react-dom/server');

const app = new koa();
const router = new koaRouter();

import { configureStore } from '../src/store';

const { persistor, store } = configureStore();
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Provider } from 'react-redux';

import { getState } from './StateBuilder';

router.get('(.*)', async (ctx) => {
    let file = path.resolve('./build' + ctx.path);
    if (file && fs.existsSync(file) && fs.lstatSync(file).isFile()) {
        try {
            if (file.endsWith('.css')) {
                ctx.set('Content-Type', 'text/css');
            }
            if (file.endsWith('.svg')) {
                ctx.set('Content-Type', 'image/svg+xml');
            }
            ctx.body = fs.createReadStream(file);
            return;
        } catch (e) {}
    }

    const state = await getState(ctx.path);

    const app = ReactDOMServer.renderToString(
    <Provider store={store}>
            <App ssrRoute={ctx.path} ssrState={state} />
    </Provider>);
    const indexFile = path.resolve('./build/index.html');
    ctx.body = fs.readFileSync(indexFile, 'utf8').replace('<div id="root"></div>', `<div id="root">${app}</div>`)
});

app.use(cors({ credentials: true }));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => console.log('running on port 3000'));
