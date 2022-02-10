import golos from 'golos-lib-js'

import { initGolos } from '@/server/initGolos'

import {
    NOTE_, NOTE_PST_HIDMSG_LST, NOTE_PST_HIDMSG_LST_ACCS, NOTE_PST_HIDACC_LST, NOTE_PST_HIDACC_LST_ACCS,
    getValues, findForum, getUrl
} from '@/server/getForums'

async function fillDonates(post, bannedAccs) {
    const { author, permlink } = post
    post.donate_list = await golos.api.getDonatesAsync(false, {author, permlink}, '', '', 200, 0, false)
    for (let item of post.donate_list) {
        item.from_banned = !!bannedAccs[item.from]
    }
    post.donate_uia_list = await golos.api.getDonatesAsync(true, {author, permlink}, '', '', 200, 0, false)
    for (let item of post.donate_uia_list) {
        item.from_banned = !!bannedAccs[item.from]
    }
}

async function fillDonatesBatch(data, targets, bannedAccs) {
    const results = await golos.api.getDonatesForTargetsAsync(targets, 200, 0, false);;
    for (let i = 0; i < results.length; i += 2) {
        const post = data[i / 2];
        if (!post) break;
        post.donate_list = results[i];
        for (let item of post.donate_list) {
            item.from_banned = !!bannedAccs[item.from];
        }
        post.donate_uia_list = results[i + 1];
        for (let item of post.donate_uia_list) {
            item.from_banned = !!bannedAccs[item.from];
        }
    }
}

export async function getPost(category, author, permlink) {
    initGolos()

    const vals = await getValues()

    // for .chunk.js.map file requests which becoming meant as this route
    // example: GET /static/@js/8.4538698b.chunk.js.map
    if ((author === 'js' || author === 'css')
        && category === 'static') {
        return
    }

    let { _id, forum } = findForum(vals[NOTE_], category)

    let data = await golos.api.getContentAsync(author, permlink, $GLS_Config.forum.votes_per_page, 0)
    data.url = getUrl(data.url, _id)
    await fillDonates(data, vals[NOTE_PST_HIDACC_LST])
    data.author_banned = !!vals[NOTE_PST_HIDACC_LST][data.author]
    data.post_hidden = !!vals[NOTE_PST_HIDMSG_LST][data.id]
    forum.moders = vals[NOTE_PST_HIDMSG_LST_ACCS]
    forum.supers = vals[NOTE_PST_HIDACC_LST_ACCS]
    forum.admins = []
    forum.banned = vals[NOTE_PST_HIDACC_LST]
    let ret = {
        data: data,
        forum: forum,
        vals,
    }
    return ret
}

export async function getPostResponses(category, author, permlink, vals = undefined) {
    initGolos()

    if (!vals) {
        vals = await getValues()
    }

    let targets = []

    let data = await golos.api.getAllContentRepliesAsync(author, permlink, $GLS_Config.forum.votes_per_page, 0, [], [], false, 'false')
    for (let item of data) {
        item.url = getUrl(item.url, category)
        item.author_banned = !!vals[NOTE_PST_HIDACC_LST][item.author]
        let body = item.body
        let firstSpace = body.indexOf(' ')
        let firstWord = body.substring(0, firstSpace)
        if (firstWord) {
            let after = body.substring(firstSpace)
            if (!firstWord.startsWith('[@')) {
                let replyAuthor = ''
                if (item.depth > 1) replyAuthor = '[@' + item.parent_author + '](#@' + item.parent_author + '/' +  item.parent_permlink + '), '
                if (firstWord.startsWith('@')) {
                    item.body = replyAuthor + `${after}`
                } else {
                    item.body = replyAuthor + `${firstWord}${after}`
                }
            }
        }
        targets.push({ author: item.author, permlink: item.permlink })
    }
    await fillDonatesBatch(data, targets, vals[NOTE_PST_HIDACC_LST])
    let ret = {
        data: data,
    }
    return ret
}
