const helmet = require('koa-helmet');

const CONFIG = require('../config');

function convertEntriesToArrays(obj) {
    return Object.keys(obj).reduce((result, key) => {
        result[key] = obj[key].split(/\s+/);
        return result;
    }, {});
}

module.exports = function(app, forceProd = false) {
    app.use(helmet());

    const env = process.env.NODE_ENV || 'development';

    // helmet wants some things as bools and some as lists, makes config difficult.
    // our config uses strings, this splits them to lists on whitespace.
    if ((env === 'production' || forceProd) && CONFIG.helmet) {
        const helmetConfig = {
            directives: convertEntriesToArrays(CONFIG.helmet.directives),
            reportOnly: false,
        };
        helmetConfig.directives.reportUri = CONFIG.rest_api + '/csp_violation';
        app.use(helmet.contentSecurityPolicy(helmetConfig));
    }
}
