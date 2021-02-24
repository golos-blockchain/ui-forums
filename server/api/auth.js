const koaRouter = require('koa-router');
const golos = require('golos-classic-js');
const gmailSend = require('gmail-send');
const fs = require('fs');
const btoa = require('btoa');
const passport = require('koa-passport');
const VKontakteStrategy = require('passport-vk').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MailruStrategy = require('passport-mail').Strategy;
const YandexStrategy = require('passport-yandex').Strategy;

const CONFIG = require('../../config');
const CONFIG_SEC = require('../../configSecure');

function useAuthApi(app) {

    const bodyParser = require('koa-bodyparser');
    app.use(bodyParser());

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    const router = koaRouter({prefix: '/auth'});
    app.use(router.routes());

    const returnError = (ctx, err) => {
        ctx.body = {
            "data": err,
            "network": {}, 
            "status": "err"
        };
    };

    if (CONFIG_SEC.registrar.vk.enabled) {
        try {
            passport.use(new VKontakteStrategy(
              {
                  clientID: CONFIG_SEC.registrar.vk.client_id,
                  clientSecret: CONFIG_SEC.registrar.vk.client_secret,
                  callbackURL: '/auth/vk/callback',
                  passReqToCallback: true
              },
              (req, accessToken, refreshToken, params, profile, done) => {
                  req.session.soc_id = profile.id;
                  req.session.soc_id_type = 'vk_id';
                  done(null, {profile});
              }
            ));
        } catch (ex) {
            console.error('ERROR: Wrong registrar.vk settings. Fix them or just disable registration with vk. Error is following:')
            throw ex;
        }
    }

    if (CONFIG_SEC.registrar.facebook.enabled) {
        try {
            passport.use(new FacebookStrategy(
              {
                  clientID: CONFIG_SEC.registrar.facebook.client_id,
                  clientSecret: CONFIG_SEC.registrar.facebook.client_secret,
                  callbackURL: '/auth/facebook/callback',
                  passReqToCallback: true
              },
              (req, accessToken, refreshToken, params, profile, done) => {
                  req.session.soc_id = profile.id;
                  req.session.soc_id_type = 'facebook_id';
                  done(null, {profile});
              }
            ));
        } catch (ex) {
            console.error('ERROR: Wrong registrar.facebook settings. Fix them or just disable registration with facebook. Error is following:')
            throw ex;
        }
    }

    if (CONFIG_SEC.registrar.mailru.enabled) {
        try {
            passport.use(new MailruStrategy(
              {
                  clientID: CONFIG_SEC.registrar.mailru.client_id,
                  clientSecret: CONFIG_SEC.registrar.mailru.client_secret,
                  callbackURL: '/auth/mailru/callback',
                  passReqToCallback: true
              },
              (req, accessToken, refreshToken, params, profile, done) => {
                  req.session.soc_id = profile.id;
                  req.session.soc_id_type = 'mailru_id';
                  done(null, {profile});
              }
            ));
        } catch (ex) {
            console.error('ERROR: Wrong registrar.mailru settings. Fix them or just disable registration with mailru. Error is following:')
            throw ex;
        }
    }

    if (CONFIG_SEC.registrar.yandex.enabled) {
        try {
            passport.use(new YandexStrategy(
              {
                  clientID: CONFIG_SEC.registrar.yandex.client_id,
                  clientSecret: CONFIG_SEC.registrar.yandex.client_secret,
                  callbackURL: '/auth/yandex/callback',
                  passReqToCallback: true
              },
              (req, accessToken, refreshToken, params, profile, done) => {
                  req.session.soc_id = profile.id;
                  req.session.soc_id_type = 'yandex_id';
                  done(null, {profile});
              }
            ));
        } catch (ex) {
            console.error('ERROR: Wrong registrar.yandex settings. Fix them or just disable registration with yandex. Error is following:')
            throw ex;
        }
    }

    router.get('/', (ctx, next) => {
        const methods = ['email'];
        if (CONFIG_SEC.registrar.vk.enabled) methods.push('vk');
        if (CONFIG_SEC.registrar.facebook.enabled) methods.push('facebook');
        if (CONFIG_SEC.registrar.mailru.enabled) methods.push('mailru');
        if (CONFIG_SEC.registrar.yandex.enabled) methods.push('yandex');
        ctx.body = {
            "data": {
                methods
            },
            "network": {}, 
            "status": "ok"
        }
    });

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
        let toRegister = {username, owner, active, posting, memo};
        toRegister.code = veri_code;

        fs.writeFileSync('verification_codes/' + btoa(ctx.params.email) + '.txt', JSON.stringify(toRegister));

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

    router.get('/verify_email/:email?/:code?/:username?/:owner?/:active?/:posting?/:memo?', async (ctx) => {
        let verCodePath = "";

        let toRegister = null;
        if (!ctx.params.username) { // email case
            verCodePath = 'verification_codes/' + btoa(ctx.params.email) + '.txt';
            try {
                toRegister = JSON.parse(fs.readFileSync(verCodePath, 'utf8'));
            } catch (e) {
                return returnError(ctx, 'Wrong code');
            }
            if (toRegister.code != ctx.params.code) {
                return returnError(ctx, 'Wrong code');
            }
        } else {
            toRegister = ctx.params;
            if (!toRegister || !toRegister.username || !ctx.session.soc_id || !ctx.session.soc_id_type) {
                return returnError(ctx, 'Wrong toRegister in session');
            }
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
            let meta = {};
            if (ctx.session.soc_id_type && ctx.session.soc_id) {
                meta[ctx.session.soc_id_type] = ctx.session.soc_id;
            }
            await golos.broadcast.accountCreateWithDelegationAsync(CONFIG_SEC.registrar.signing_key,
              CONFIG_SEC.registrar.fee, CONFIG_SEC.registrar.delegation,
              CONFIG_SEC.registrar.account, toRegister.username, 
                {weight_threshold: 1, account_auths: [], key_auths: [[toRegister.owner, 1]]},
                {weight_threshold: 1, account_auths: [], key_auths: [[toRegister.active, 1]]},
                {weight_threshold: 1, account_auths: [], key_auths: [[toRegister.posting, 1]]},
                toRegister.memo,
              JSON.stringify(meta), aro);
            await new Promise(resolve => setTimeout(resolve, 1000));
            accs = await golos.api.getAccountsAsync([toRegister.username]);
        } catch (err) {
            return returnError(ctx, err.toString())
        }

        if (!accs || !accs.length) {
            return returnError(ctx, 'unknown reason');
        }

        if (verCodePath) fs.unlinkSync(verCodePath);

        ctx.body = {
            "network": {}, 
            "status": "ok"
        }
    });

    router.get('/vk', (ctx, next) => {
        passport.authenticate('vkontakte')(ctx, next);
    });

    router.get('/vk/callback', passport.authenticate('vkontakte', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/facebook', (ctx, next) => {
        passport.authenticate('facebook')(ctx, next);
    });

    router.get('/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/mailru', (ctx, next) => {
        passport.authenticate('mailru')(ctx, next);
    });

    router.get('/mailru/callback', passport.authenticate('mailru', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/yandex', (ctx, next) => {
        passport.authenticate('yandex')(ctx, next);
    });

    router.get('/yandex/callback', passport.authenticate('yandex', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/failure', (ctx) => {
        console.log(ctx);
        ctx.body = {
            "data": "Cannot register - cannot authorize with social network.",
            "network": {}, 
            "status": "err"
        };
    });

    router.get('/success', (ctx) => {
        ctx.body = '<script>window.close();</script>';
    });
}

module.exports = { useAuthApi };
