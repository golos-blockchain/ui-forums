const reader = require('readline-sync');
const golos = require('golos-lib-js');

const CONFIG = require('../config');

golos.config.set('websocket', CONFIG.golos_node);
golos.config.set('chain_id', CONFIG.golos_chain_id);

const PREFIX = 'g.f.';
const PREFIX_PST = 'g.pst.f.';

const LST = '.lst';
const ACCS = '.accs';

const GLOBAL_ID = CONFIG.forum._id.toLowerCase();
const NOTE_     = PREFIX + GLOBAL_ID;
const NOTE_PST_ = PREFIX_PST + GLOBAL_ID;
const NOTE_PST_HIDMSG_LST      = NOTE_PST_ + '.hidmsg' + LST;
const NOTE_PST_HIDACC_LST      = NOTE_PST_ + '.hidacc' + LST;
const NOTE_PST_STATS_LST       = NOTE_PST_ + '.stats' + LST;

function idToTag(_id) {
    return 'fm-' + GLOBAL_ID + '-' + _id.toLowerCase();
}

async function fillStats(stats, cats, hidden, banned, parentStats = []) {
    if (!cats) return;
    for (let _id in cats) {
        const tag = idToTag(_id);
        console.log('Getting posts in category:', _id, '(' + tag + ')');

        let stat = {posts: 0, total_posts: 0, comments: 0, total_comments: 0};
        const posts = await golos.api.getAllDiscussionsByActiveAsync(
            '', '', 0, 1000000,
            [tag],
            0, 0);

        if (posts[tag])
            for (let post of posts[tag]) {
                const good = !banned[post.author] && !hidden[post.id];

                ++stat.total_posts;
                if (good) {
                    ++stat.posts;
                    stat.total_comments += post.children;
                    stat.comments += post.children;
                }

                for (const parentStat of parentStats) {
                    ++parentStat.total_posts;
                    if (good) {
                        ++parentStat.posts;
                        parentStat.total_comments += post.children;
                        parentStat.comments += post.children;
                    }
                }
            }

        await fillStats(stats, cats[_id].children, hidden, banned, [...parentStats, stat]);

        console.log('Collected stat:', _id, stat);
        stats[_id] = stat;
    }
}

(async () => {
    console.log('WELCOME TO FIX_STATS!');
    console.log('Forum _id: ' + GLOBAL_ID);
    console.log('Forum creator: ' + CONFIG.forum.creator);
    console.log('');

    let wif = null;
    while (!wif) {
        wif = reader.question('@' + CONFIG.forum.creator + ', enter your posting private key: ');
        const auth = await golos.auth.login(CONFIG.forum.creator, wif);
        if (auth.active && !auth.password) {
            console.error('Login failed! Use posting, not active key.');
            wif = null;
            continue;
        }
        if (!auth.posting) {
            console.log('Login failed! Incorrect key.');
            wif = null;
        }
    }

    console.log('Obtaining all information...');
    const vals = await golos.api.getValuesAsync(CONFIG.forum.creator,
        [NOTE_, NOTE_PST_HIDMSG_LST, NOTE_PST_HIDACC_LST]);
    console.log(vals);

    const cats = JSON.parse(vals[NOTE_]);
    console.log('Categories tree:', JSON.stringify(cats));

    const hidden = JSON.parse(vals[NOTE_PST_HIDMSG_LST] || '{}');
    console.log('Hidden posts:', JSON.stringify(hidden));

    const banned = JSON.parse(vals[NOTE_PST_HIDACC_LST] || '{}');
    console.log('Banned accs:', JSON.stringify(banned));

    let stats = {};
    await fillStats(stats, cats, hidden, banned);

    console.log('Clearing stat...');
    await golos.broadcast.customJsonAsync(wif, [], [CONFIG.forum.creator], 'account_notes',
        JSON.stringify(['set_value', {
            account: CONFIG.forum.creator,
            key: NOTE_PST_STATS_LST,
            value: ''
        }]));
    console.log('Setting stat: ', JSON.stringify(stats));
    await golos.broadcast.customJsonAsync(wif, [], [CONFIG.forum.creator], 'account_notes',
        JSON.stringify(['set_value', {
            account: CONFIG.forum.creator,
            key: NOTE_PST_STATS_LST,
            value: JSON.stringify(stats)
        }]));
    console.log('SUCCESSFUL!');
    console.log('Press Ctrl+C to exit');
})();
