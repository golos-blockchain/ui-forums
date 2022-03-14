module.exports = {
    site_domain: 'https://dev.golostalk.com',
    golos_chain_id: '782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12',
    golos_server_node: 'https://apibeta.golos.today',
    proxy_node: true,
    forum: {
        _id: 'golostalk',
        creator: 'golostalk',
        favicon_png_image: 'https://i.imgur.com/2T03CJ5.png',
        meta_image: 'https://i.imgur.com/0AeZtdV.png',
        // html is supported in all fields excl. description, logo_title
        footer_banner: '<a href="https://golos.id" target="_new"><img style="width: 700px" src="https://i.imgur.com/6mxuwsE.jpg" /></a>',
        ru: {
            meta_title: 'GolosTalk - форум на базе блокчейна Голос',
            meta_description: 'Форум с вознаграждениями токенами, работающий на базе децентрализованного блокчейна.',
            logo_title: 'GolosTalk.com',
            title: 'Форум на блокчейне Голос',
            description: 'Пишите, общайтесь, получайте вознаграждения и награждайте других :)',
            link_title: 'GolosTalk',
            page_title: 'Форум на ГОЛОС',
            footer_title: 'Возникли вопросы?<br/>Напишите в телеграм-группу <a href="https://t.me/goloshelp" target="_new">@goloshelp</a>',
            footer_description: 'GolosTalk — форум на платформе <a href="https://golos.id" target="_new">блокчейна Голос</a> (разработан <a href="https://golos.id/@id-raccoon-hater" target="_new">@id-raccoon-hater</a>)'
        },
        en: {
            meta_title: 'GolosTalk - forum based on the Golos blockchain',
            meta_description: 'Forum with token rewards that operates on the basis of a decentralized blockchain.',
            logo_title: '<img style="margin: -13px -17px -16px -18px" src="https://i.imgur.com/QP3yc26.png" />',
            title: 'Forum on Golos Blockchain',
            description: 'Write, communicate, receive rewards and reward others',
            link_title: 'GolosTalk',
            page_title: 'Forum on GOLOS',
            footer_title: 'Have any questions?<br/>Write to the telegram group <a href="https://t.me/goloshelp" target="_new">@goloshelp</a>',
            footer_description: 'GolosTalk — forum on the <a href="https://golos.id" target="_new">Golos blockchain</a> platform (developed by <a href="https://golos.id/@id-raccoon-hater" target="_new">@id-raccoon-hater</a>).'
        },
        posts_per_page: 20,
        replies_per_page: 15,
        votes_per_page: 10,
        donates_per_page: 10
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
    golos_signer: {
        host: 'https://dev.golos.app',
        client: 'golostalk'
    },
    notify_service: {
        host: 'https://devnotify.golos.app'
    },
    messenger_service: {
        host: "https://devchat.golos.app"
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
            scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval'",
            styleSrc: "'self' 'unsafe-inline' fonts.googleapis.com",
            imgSrc: "* data:",
            fontSrc: "'self' data: fonts.gstatic.com",
            connectSrc: "'self' api.imgur.com *.golos.today auth.golostalk.com *.golos.app",
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
            'github.com',
            't.me',
            'twitter.com',
            'coinmarketcap.com',
            'coins.black'
        ]
    },
    cache: { 
        // Кеширование настроек форума (категории, модераторы, супер-модераторы),
        // состояния постов и пользователей (скрытые, заблокированные)
        // и статистики (кол-во постов и комментариев в категориях)
        // Кеш мгновенно обновляется при действиях, поэтому НЕ создает задержек.
        // Но если есть какие-то неполадки, то можно уменьшить значение
        account_notes_age_seconds: 5*60
    }
};
