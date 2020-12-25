module.exports = {
    GOLOS_NODE: 'wss://apibeta.golos.today/ws',
    //GOLOS_CHAIN_ID: '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679',
    REST_API: 'http://144.91.110.80:5000',
    FORUM: {
        _id: 'golostalks',
        creator: 'cyberfounder',
        footer_banner: '<a href="https://golos.id" target="_new"><img src="https://i.imgur.com/6mxuwsE.jpg" /></a>', // 700x90 px
        // html is supported in all fields excl. breadcrumb_title, page_title
        ru: {
            meta_title: 'GolosTalk - форум на базе блокчейна Голос',
            meta_description: 'Форум с вознаграждениями токенами, работающий на базе децентрализованного блокчейна.',
            title: 'Форум на блокчейне Голос',
            description: 'Пишите, общайтесь, получайте вознаграждения и награждайте других :)',
            breadcrumb_title: 'GolosTalk',
            logo_title: 'GolosTalk.com',
            page_title: 'Форум на ГОЛОС',
            footer_title: 'Возникли вопросы?<br/>Напишите в телеграм-группу <a href="https://t.me/goloshelp" target="_new">@goloshelp</a>',
            footer_description: 'GolosTalk — форум на платформе <a href="https://golos.id" target="_new">блокчейна Голос</a> (разработан <a href="https://golos.id/@id-raccoon-hater" target="_new">@id-raccoon-hater</a>)'
        },
        en: {
            meta_title: 'GolosTalk - forum based on the Golos blockchain',
            meta_description: 'Forum with token rewards that operates on the basis of a decentralized blockchain.',
            title: 'Forum on Golos Blockchain',
            description: 'On this forum <b>you</b> can post, donate and receive others donates :)',
            breadcrumb_title: 'GolosTalk',
            logo_title: 'GolosTalk.com',
            page_title: 'Forum on GOLOS',
            footer_title: 'GolosTalk.com',
            footer_description: 'An experimental forum built on top of the <a href="https://golos.id" target="_new">Golos Blockchain</a>.<br/>Brought to you by <a href="https://golos.id/@id-raccoon-hater" target="_new">id-raccoon-hater</a>.'
        }
    },
    STM_Config: {
        img_proxy_prefix: 'https://steemitimages.com/',
        ipfs_prefix: false,
        upload_image: 'https://steemitimages.com',
    },
    MODERATION: {
        // if post/comment has lesser net_rshares, it will be hidden
        hide_threshold: -9999999999
    },
    PROGRESSION: {
        increment: 25,
        steps: [
            1.375, 4.050, 7.959, 14.300,
            23.587, 35.625, 50.225, 67.200,
            86.362, 107.525, 130.500, 155.100,
            178.450, 200.550
        ]
    }
};
