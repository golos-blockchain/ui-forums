module.exports = {
    registrar: {
        account: 'lex',
        referer: 'lex',
        fee: '1.000 GOLOS',
        signing_key: '5JFZC7AtEe1wF2ce6vPAUxDeevzYkPgmtR14z9ZVgvCCtrFAaLw',
        delegation: '33060.000000 GESTS',
        email_sender: 'registrator@golostalk.com',
        vk: {
            enabled: true,
            client_id: '7729925',
            client_secret: 'XDpHjeomxnZJOIwnp0SM'
        },
        facebook: {
            enabled: true,
            client_id: '400946054546292',
            client_secret: '62fefc26e01cce7c56aed3e2b0c2f5bf'
        },
        telegram: {
            enabled: false,
            bot_token: '1559315861:AAFWDjcRP0dgsccGEosqBZEgdggHWUOgDU8'
        },
        mailru: {
            enabled: true,
            client_id: '783069',
            client_secret: '61f78ffeb9411b6289150d46a93ee034'
        },
        twitter: {
            enabled: false
        },
        yandex: {
            enabled: true,
            client_id: '9e9787bd59204b95812bc7e438939616',
            client_secret: 'ca10592646784980a11179cc72146344'
        },
        // email_subject and email_html can contain one of forum titles, example: {FORUM.link_title}
        // email_html should contain verification code: {verification_code}
        ru: {
            email_subject: 'Подтвердите регистрацию на {FORUM.link_title}',
            email_html: 'Ваш код подтверждения: <h4>{verification_code}</h4>'
        },
        en: {
            email_subject: 'Verify {FORUM.link_title} sign up',
            email_html: 'Your verification code: <h4>{verification_code}</h4>'
        }
    },
    gmail_send: {
        user: 'halfyearforwhat@gmail.com',
        pass: 'yforlmawttbbczrv',
    },
    anti_phishing: {
        enabled: true,
        white_list: [
            'golos.id',
            'golos.in',
            'golos.today',
            'golostalk.com',
            'golos.cf',
            'dpos.space',
            'rudex.org',
            'steem-engine.com',
            'github.com',
            't.me',
            'twitter.com',
            'vk.com',
            'coinmarketcap.com',
            'sharpay.io',
            'coins.black',
            'golos.chatbro.com'
        ]
    }
};
