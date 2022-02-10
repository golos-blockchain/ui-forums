import golos from 'golos-lib-js'

import {
    NOTE_, NOTE_PST_HIDMSG_LST, NOTE_PST_HIDMSG_LST_ACCS, NOTE_PST_HIDACC_LST, NOTE_PST_HIDACC_LST_ACCS,
    getValues, getAllTags, findForum, getUrl,
} from '@/server/getForums'

export async function getAccount(username) {
    const vals = await getValues()

    let data = await golos.api.getAccountsAsync([username])
    let ret = {
        data: data[0],
        moders: vals[NOTE_PST_HIDMSG_LST_ACCS],
        hidden: vals[NOTE_PST_HIDMSG_LST],
        supers: vals[NOTE_PST_HIDACC_LST_ACCS],
        banned: vals[NOTE_PST_HIDACC_LST],
        vals,
    }
    return ret
}

export async function getAccountPosts(vals, username) {

    const hidden = vals[NOTE_PST_HIDMSG_LST];
    const banned = vals[NOTE_PST_HIDACC_LST];

    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let data = await golos.api.getDiscussionsByBlogAsync({
        select_authors: [username],
        limit: 100
    });
    let posts = [];
    for (let post of data) {
        const tag = post.url.split('/')[1];
        const _id = tagIdMap[tag];
        if (!_id) continue;
        post.url = getUrl(post.url, _id);
        post.forum = findForum(vals[NOTE_], _id); // for moderation
        post.post_hidden = !!hidden[post.id];
        post.author_banned = !!banned[post.author];
        posts.push(post);
    }
    let ret = {
        total: posts.length,
        posts,
    }
    return ret
}

export async function getAccountResponses(vals, username) {
    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let data = await golos.api.getRepliesByLastUpdateAsync(
        username,
        '', 100,
        0, 0
    );
    let responses = [];
    for (let post of data) {
        const tag = post.url.split('/')[1];
        const _id = tagIdMap[tag];
        if (!_id) continue;
        post.url = getUrl(post.url, _id);
        responses.push({parent: {depth: 0}, reply: post});
    }
    let ret = {
        total: responses.length,
        responses
    }
    return ret
}

export async function getAccountDonates(vals, username, direction = 'to', page = 1) {

    let tags = [];
    let tagIdMap = {};
    getAllTags(vals[NOTE_], tags, tagIdMap);

    let donates = await golos.api.getAccountHistoryAsync(username, -1, 1000, {
        select_ops: ['donate_operation'],
        direction: direction === 'from' ? 'sender' : 'receiver'
    });

    const banned = vals[NOTE_PST_HIDACC_LST];

    donates = donates.filter((op) => {
        let item = op[1].op[1];
        op[1].from_banned = !!banned[item.from];
        op[1].to_banned = !!banned[item.to];
        const { author, permlink, _category, _root_author } = item.memo.target;
        if (author && permlink) {
            if (!_category) return false; // Not version 2+ which is used on chainBB 
            const _id = tagIdMap[_category];
            if (!_id) return false; // Not from this chain BB forum
            op[1]._category = _id;
            op[1].author_banned = !!banned[author];
            op[1].root_author_banned = !!banned[_root_author];
        } else {
            return false;
        }
        return true;
    });

    const total = donates.length;

    const start = page ? (page - 1) * $GLS_Config.forum.account_donates_per_page : 0;
    const end = start + $GLS_Config.forum.account_donates_per_page;
    donates = donates.slice(start, end);

    let ret = {
        donates,
        total
    }

    return ret
}
