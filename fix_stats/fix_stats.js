const reader = require('readline-sync');
const golos = require('golos-classic-js');

const CONFIG = require('../config');

golos.config.set('websocket', CONFIG.GOLOS_NODE);
if (CONFIG.GOLOS_CHAIN_ID) golos.config.set('chain_id', CONFIG.GOLOS_CHAIN_ID);

const PREFIX = 'g.f.';
const PREFIX_PST = 'g.pst.f.';

const LST = '.lst';
const ACCS = '.accs';

const GLOBAL_ID = CONFIG.FORUM._id.toLowerCase();
const NOTE_     = PREFIX + GLOBAL_ID;
const NOTE_PST_ = PREFIX_PST + GLOBAL_ID;
const NOTE_PST_HIDMSG_LST      = NOTE_PST_ + '.hidmsg' + LST;
const NOTE_PST_HIDACC_LST      = NOTE_PST_ + '.hidacc' + LST;
const NOTE_PST_STATS_LST       = NOTE_PST_ + '.stats' + LST;

function categoriesIdsArr(cats, idsArr) {
    for (let cat of Object.keys(cats)) {
        idsArr.push(cat);
        if (cats[cat].children) {
            categoriesIdsArr(cats[cat].children, idsArr);
        }
    }
}

function idToTag(_id) {
    return 'fm-' + GLOBAL_ID + '-' + _id.toLowerCase();
}

console.log('WELCOME TO FIX_STATS!');
console.log('Forum _id: ' + GLOBAL_ID);
console.log('Forum creator: ' + CONFIG.FORUM.creator);
console.log('');
const wif = reader.question('@' + CONFIG.FORUM.creator + ', enter your posting private key: ');

console.log('Obtaining all information...');
golos.api.getValues(CONFIG.FORUM.creator, [NOTE_, NOTE_PST_HIDMSG_LST, NOTE_PST_HIDACC_LST],
    async (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(result);

    const cats = JSON.parse(result[NOTE_]);
    console.log('Categories tree:', JSON.stringify(cats));
    const idsArr = [];
    categoriesIdsArr(cats, idsArr);
    console.log('Categories _id list:', JSON.stringify(idsArr));

    const hidden = JSON.parse(result[NOTE_PST_HIDMSG_LST] || '{}');
    console.log('Hidden posts:', JSON.stringify(hidden));

    const banned = JSON.parse(result[NOTE_PST_HIDACC_LST] || '{}');
    console.log('Banned accs:', JSON.stringify(banned));

    let stats = {};
    for (let _id of idsArr) {
        const tag = idToTag(_id);
        console.log('Getting posts in category:', _id, '(' + tag + ')');

        let stat = {posts: 0, total_posts: 0, comments: 0, total_comments: 0};
        const posts = await golos.api.getAllDiscussionsByActive(
            '', '', 0, 1000000,
            tag,
            0, 0);

        for (let post of posts) {
            ++stat.total_posts;
            if (!banned[post.author] && !hidden[post.id]) {
                ++stat.posts;
                stat.total_comments += post.children;
                stat.comments += post.children;
            }
        }

        console.log('Collected stat:', stat);
        stats[_id] = stat;
    }

    console.log('Setting stat: ', JSON.stringify(stats));
    await golos.broadcast.customJson(wif, [], [CONFIG.FORUM.creator], 'account_notes',
        JSON.stringify(['set_value', {
            account: CONFIG.FORUM.creator,
            key: NOTE_PST_STATS_LST,
            value: JSON.stringify(stats)
        }]));
    console.log('SUCCESSFULL!');
    console.log('Press Ctrl+C to exit');
});