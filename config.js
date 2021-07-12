module.exports = {
    GOLOS_NODE: 'https://restdev.golostalk.com/node_send',
    GOLOS_MSGS_NODE: 'wss://apibeta.golos.today/ws',
    GOLOS_CHAIN_ID: '782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12',
    REST_API: 'https://restdev.golostalk.com',
    FORUM: {
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
    STM_Config: {
        img_proxy_prefix: 'https://devimages.golos.today/',
        img_proxy_backup_prefix: 'https://steemitimages.com/',
        ipfs_prefix: false,
        upload_image: 'https://api.imgur.com/3/image',
        max_upload_file_bytes: 1 * 1024 * 1024,
        client_id: 'b4d78455f0d5fca'
    },
    NOTIFY_SERVICE: {
        host: 'https://devnotify.golos.today/'
    },
    ELASTIC_SEARCH: {
        url: 'https://search.golos.today',
        login: 'golosclient',
        password: 'golosclient'
    }
};
