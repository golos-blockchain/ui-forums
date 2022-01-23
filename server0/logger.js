const logger = require('koa-logger');

function useLogger(app) {
    app.use(logger((str, args) => {
        const [format, method, url] = args;

        // === is faster than split, RegExp and even startsWith
        if (url === '/node_send') return;

        console.log(...args);
    }));
}

module.exports = useLogger;
