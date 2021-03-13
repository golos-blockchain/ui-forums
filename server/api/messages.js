const koaRouter = require('koa-router');
const golos = require('golos-classic-js');

function useMessagesApi(app) {

    const router = koaRouter({prefix: '/msgs'});
    app.use(router.routes());

    const returnError = (ctx, err) => {
        ctx.body = {
            "data": err,
            "network": {}, 
            "status": "err"
        };
    };

    router.get('/contacts/@:from', async (ctx, next) => {
        let { from } = ctx.params;

        let contacts = await golos.api.getContactsAsync(from, 'unknown', 100, 0);

        let accountNames = new Set();
        for (const contact of contacts) {
            accountNames.add(contact.contact);
        }

        let accounts = {};
        const accountsArr = await golos.api.getAccounts([...accountNames]);
        for (let account of accountsArr) {
            accounts[account.name] = account;
        }

        ctx.body = {
            "data": {
                contacts,
                accounts,
            },
            "network": {}, 
            "status": "ok"
        }
    });

    router.get('/contacts/search/:query', async (ctx, next) => {
        let { query } = ctx.params;

        const accountNames = await golos.api.lookupAccounts(query, 6);

        const accountsArr = await golos.api.getAccounts([...accountNames]);

        ctx.body = {
            "data": accountsArr,
            "network": {}, 
            "status": "ok"
        }
    });

    router.get('/chat/@:from/@:to', async (ctx, next) => {
        let { from, to } = ctx.params;

        let messages = [];
        from = from.replace('@', '');
        to = to.replace('@', '');
        messages = await golos.api.getThreadAsync(from, to, {});

        let accountNames = new Set();
        accountNames.add(to);

        let accounts = {};
        const accountsArr = await golos.api.getAccounts([...accountNames]);
        for (let account of accountsArr) {
            accounts[account.name] = account;
        }

        ctx.body = {
            "data": {
                messages,
                accounts,
            },
            "network": {}, 
            "status": "ok"
        }
    });

}

module.exports = { useMessagesApi };
