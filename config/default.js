module.exports = {
    golos_node: 'http://37.18.27.45:3000/api/node_send',
    golos_msgs_node: 'wss://apibeta.golos.today/ws',
    golos_chain_id: '782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12',
    rest_api: 'https://dev.golostalk.com',
    forum: {
        _id: 'golostalk',
        creator: 'golostalk',
        footer_banner: '<a href="https://golos.id" target="_new"><img style="width: 700px" src="https://i.imgur.com/6mxuwsE.jpg" /></a>',
        meta_image: 'https://i.imgur.com/0AeZtdV.png',
        // html is supported in all fields excl. breadcrumb_title, page_title
        ru: {
            meta_title: 'GolosTalk - форум на базе блокчейна Голос',
            meta_description: 'Форум с вознаграждениями токенами, работающий на базе децентрализованного блокчейна.',
            title: 'Форум на блокчейне Голос',
            description: 'Пишите, общайтесь, получайте вознаграждения и награждайте других :)',
            breadcrumb_title: 'GolosTalk',
            logo_title: 'GolosTalk.com',
            page_title: 'Форум на ГОЛОС',
            link_title: 'GolosTalk',
            footer_title: 'Возникли вопросы?<br/>Напишите в телеграм-группу <a href="https://t.me/goloshelp" target="_new">@goloshelp</a>',
            footer_description: 'GolosTalk — форум на платформе <a href="https://golos.id" target="_new">блокчейна Голос</a> (разработан <a href="https://golos.id/@id-raccoon-hater" target="_new">@id-raccoon-hater</a>)'
        },
        en: {
            meta_title: 'GolosTalk - forum based on the Golos blockchain',
            meta_description: 'Forum with token rewards that operates on the basis of a decentralized blockchain.',
            title: 'Forum on Golos Blockchain',
            description: 'Write, communicate, receive rewards and reward others',
            breadcrumb_title: 'GolosTalk',
            logo_title: '<img style="margin: -13px -17px -16px -18px" src="https://i.imgur.com/QP3yc26.png" />',
            page_title: 'Forum on GOLOS',
            link_title: 'GolosTalk',
            footer_title: 'Have any questions?<br/>Write to the telegram group <a href="https://t.me/goloshelp" target="_new">@goloshelp</a>',
            footer_description: 'GolosTalk — forum on the <a href="https://golos.id" target="_new">Golos blockchain</a> platform (developed by <a href="https://golos.id/@id-raccoon-hater" target="_new">@id-raccoon-hater</a>).'
        },
        posts_per_page: 20,
        replies_per_page: 15,
        votes_per_page: 10,
        donates_per_page: 10,
        account_donates_per_page: 10
    },
    images: {
        img_proxy_prefix: 'https://devimages.golos.today',
        img_proxy_backup_prefix: 'https://steemitimages.com',
        upload_image: 'https://api.imgur.com/3/image',
        client_id: 'b4d78455f0d5fca'
    },
    auth_service: {
        host: 'https://dev.golos.app',
        custom_client: 'golostalk'
    },
    notify_service: {
        host: 'https://devnotify.golos.app'
    },
    elastic_search: {
        url: 'https://search.golos.today',
        login: 'golosclient',
        password: 'golosclient'
    },
    helmet: {
        directives: {
            defaultSrc: "'self'",
            childSrc: "'self' www.youtube.com player.vimeo.com w.soundcloud.com *.facebook.com vk.com www.google.com *.yandex.ru",
            scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' unpkg.com/ionicons@5.4.0/",
            styleSrc: "'self' 'unsafe-inline' fonts.googleapis.com",
            imgSrc: "* data:",
            fontSrc: "'self' data: fonts.gstatic.com",
            connectSrc: "'self' restdev.golostalk.com api.imgur.com *.golos.today wss://apibeta.golos.today *.golos.app unpkg.com/ionicons@5.4.0/",
            reportUri: "/csp_violation",
            objectSrc: "'self'",
            frameAncestors: "'none'"
        }
    },
    anti_phishing: {
        enabled: true,
        white_list: [
            'golos.id',
            'golos.in',
            'golos.today',
            'golos.app',
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
