module.exports = {
    GOLOS_NODE: 'wss://apibeta.golos.today/ws',
    //GOLOS_CHAIN_ID: '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679',
    REST_API: 'http://37.18.27.45:5000',
    FORUM: {
        _id: 'golostalks',
        creator: 'cyberfounder',
        // html is supported in all fields excl. breadcrumb_title, page_title
        ru: {
            title: 'Форум на Голосе',
            description: 'На этом форуме <b>каждый</b> может что-нибудь написать, да еще и получить донаты :)',
            breadcrumb_title: 'GolosTalks',
            logo_title: 'GolosTalks.com',
            page_title: 'Форум на ГОЛОС',
            footer_title: 'GolosTalks.com',
            footer_description: 'Экспериментальный форум, построенный на основе <a href="https://golos.id" target="_new">блокчейна Голос</a>.<br/>Разработан <a href="https://golos.id/@id-raccoon-hater" target="_new">id-raccoon-hater</a>.'
        },
        en: {
            title: 'Forum on Golos Blockchain',
            description: 'On this forum <b>you</b> can post, donate and receive others donates :)',
            breadcrumb_title: 'GolosTalks',
            logo_title: 'GolosTalks.com',
            page_title: 'Forum on GOLOS',
            footer_title: 'GolosTalks.com',
            footer_description: 'An experimental forum built on top of the <a href="https://golos.id" target="_new">Golos Blockchain</a>.<br/>Brought to you by <a href="https://golos.id/@id-raccoon-hater" target="_new">id-raccoon-hater</a>.'
        }
    },
    STM_Config: {
        img_proxy_prefix: 'https://steemitimages.com/',
        ipfs_prefix: false,
        upload_image: 'https://steemitimages.com',
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
