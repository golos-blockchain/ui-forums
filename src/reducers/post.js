import { Asset } from 'golos-lib-js/lib/utils';

import * as types from '@/actions/actionTypes';
import * as ForumReducer from '@/reducers/forum';

const initialState = {
    forum: false,
    content: false,
    authors: {},
    responses: [],
    responsesLoaded: false,
    processing: {
        errors: {},
        votes: [],
        donates: [],
    },
    votes: {},
    live: {},
};

function log10(str) {
    const leadingDigits = parseInt(str.substring(0, 4), 10);
    const log = Math.log(leadingDigits) / Math.LN10 + 0.00000001
    const n = str.length - 1;
    return n + (log - parseInt(log, 10));
}

export const repLog10 = rep2 => {
    if (rep2 == null) return rep2;
    let rep = String(rep2);
    const neg = rep.charAt(0) === '-';
    rep = neg ? rep.substring(1) : rep;

    let out = log10(rep);
    if (isNaN(out)) out = 0;
    out = Math.max(out - 9, 0); // @ -9, $0.50 earned is approx magnitude 1
    out *= (neg ? -1 : 1);
    out = (out * 9) + 25; // 9 points per magnitude. center at 25
    // base-line 0 to darken and < 0 to auto hide (grep rephide)
    out = parseInt(out, 10);
    return out;
}

export default function post(state = initialState, action = {type: '_ssr_state_init'}) {
    let authors = state.authors;
    let votes = state.votes;
    let live = state.live;
    switch (action.type) {
        case types.POST_LOAD_RESOLVED:
            return Object.assign({}, state, action.payload);
        case types.POST_LOAD_BY_AUTHOR_RESOLVED:
            let { posts, totalPosts, moders, supers, hidden, banned } = action.payload;
            authors[action.payload.account] = { posts, totalPosts, moders, supers, hidden, banned };
            return Object.assign({}, state, { authors });
        case types.POST_LOAD_REPLIES_BY_AUTHOR_STARTED:
            if (authors[action.payload.account]) delete authors[action.payload.account]['replies'];
            return Object.assign({}, state, { authors });
        case types.POST_LOAD_REPLIES_BY_AUTHOR_RESOLVED:
            let { replies, totalReplies } = action.payload;
            authors[action.payload.account] = { replies, totalReplies };
            authors[action.payload.account].replies.forEach((data, index) => {
                if (data.forum) {
                    const c = authors[action.payload.account]['replies'][index];
                    const r = c['reply'];
                    const p = c['parent'];
                    authors[action.payload.account]['replies'][index]['reply']['forum'] = ForumReducer.setProgression(data.forum);
                    authors[action.payload.account]['replies'][index]['reply']['url'] = r['url'].replace(`/${r.category}/`, `/${data.forum._id}/`);
                    authors[action.payload.account]['replies'][index]['parent']['url'] = p['url'].replace(`/${r.category}/`, `/${data.forum._id}/`);
                }
            })
            return Object.assign({}, state, { authors });
        case types.POST_LOAD_RESPONSES_BY_AUTHOR_RESOLVED:
            let { responses, totalResponses } = action.payload;
            authors[action.payload.account] = { responses, totalResponses };
            return Object.assign({}, state, { authors });
        case types.POST_LOAD_DONATES_BY_AUTHOR_RESOLVED:
            let { donates, totalDonates } = action.payload;
            authors[action.payload.account] = { donates, totalDonates };
            return Object.assign({}, state, { authors });
        case types.POST_LOAD_RESPONSES_RESOLVED:
            action.payload.forEach((data, index) => {
                action.payload[index].reputation = repLog10(data['author_reputation']);
            });
            return Object.assign({}, state, {
                responses: action.payload,
                responsesLoaded: true
            });
        case types.POST_LOAD_LIVE_RESOLVED:
            live[[action.payload.author, action.payload.permlink].join('/')] = action.payload.data;
            return Object.assign({}, state, { live })
        case types.POST_REMOVE_LIVE:
            delete live[[action.payload.author, action.payload.permlink].join('/')];
            delete votes[[action.payload.author, action.payload.permlink].join('/')];
            return Object.assign({}, state, { live });
        case types.POST_LOAD_VOTES_RESOLVED:
            let { author, data, permlink } = action.payload;
            let id = [author, permlink].join('/');
            data = data.map((vote) => {
                vote['rshares'] = parseInt(vote['rshares'], 10);
                return vote;
            })
            votes[id] = data;
            return Object.assign({}, state, { votes });
        case types.POST_RESET_STATE:
            return initialState;
        case types.POST_SUBMIT_ERROR:
            return Object.assign({}, state, {
                submitted: action.payload
            });
        case types.POST_SUBMIT_RESOLVED:
            return Object.assign({}, state, {
                submitted: action.payload
            });
        case types.POST_VOTE_PROCESSING: {
            return Object.assign({}, state, {
                processing: {
                  errors: {},
                  votes: [action.payload],
                  donates: state.processing.donates
                }
            });
        } case types.POST_VOTE_RESOLVED: {
            let { content, responses } = state;
            let { author, permlink, weight, account } = action.payload;
            let voter = account.name;
            let msg = content;
            if (content.author !== author || content.permlink !== permlink) {
                for (let i in responses) {
                    if (responses[i].author === author && responses[i].permlink === permlink) {
                        msg = responses[i];
                        break;
                    }
                }
            }
            let found = null;
            for (let i in msg.active_votes) {
                if (msg.active_votes[i].voter === voter) {
                    found = msg.active_votes[i];
                    break;
                }
            }
            if (found) {
                msg.net_votes -= Math.sign(found.percent);
                msg.net_votes += Math.sign(weight);
                found.percent = weight;
            } else {
                msg.net_votes += Math.sign(weight);
                ++msg.active_votes_count;
                msg.active_votes.push({voter, percent: weight});
            }
            //setResponseVote(state, action.payload);
            return Object.assign({}, state, {
                content: content,
                responses: responses,
                processing: {
                    errors: {},
                    votes: completeProcessing(state.processing.votes, action.payload),
                    donates: state.processing.donates
                }
            });
        }
        case types.POST_VOTE_RESOLVED_ERROR: {
            return Object.assign({}, state, {
                processing: {
                    errors: setError(state, 'vote', action.response),
                    votes: completeProcessing(state.processing.votes, action.response.payload),
                    donates: state.processing.donates
                }
            });
        }
        case types.POST_VOTE_RESOLVED_ERROR_CLEAR: {
            return Object.assign({}, state, {
                processing: {
                    errors: false,
                    votes: state.processing.votes,
                    donates: state.processing.donates
                }
            });
        }
        case types.POST_LOAD_DONATES_RESOLVED: {
            let content = state.content;
            let responses = state.responses;
            let { donate_list, donate_uia_list, author, permlink } = action.payload;
            let msg = content;
            if (content.author !== author || content.permlink !== permlink) {
                for (let i in responses) {
                    if (responses[i].author === author && responses[i].permlink === permlink) {
                        msg = responses[i];
                        break;
                    }
                }
            }
            msg.donate_uia_list = donate_uia_list;
            msg.donate_list = donate_list;
            return Object.assign({}, state, {
                content: content,
                responses: responses,
                processing: {
                    errors: state.processing.errors,
                    votes: state.processing.votes,
                    donates: state.processing.donates
                }
            });
        }
        case types.POST_DONATE_PROCESSING: {
            return Object.assign({}, state, {
                processing: {
                    errors: {},
                    donates: [action.payload],
                    votes: state.processing.votes
                }
            });
        }
        case types.POST_DONATE_RESOLVED: {
            let content = state.content;
            let responses = state.responses;
            const { author, permlink, amount } = action.payload;
            const { name } = action.payload.account;
            let msg = content;
            if (content.author !== author || content.permlink !== permlink) {
                for (let i in responses) {
                    if (responses[i].author === author && responses[i].permlink === permlink) {
                        msg = responses[i];
                        break;
                    }
                }
            }
            let asset = Asset(amount);
            let list = asset.isUIA() ? msg.donate_uia_list : msg.donate_list;
            list.push({from: name, amount: amount, app: 'golos-forum'});
            if (asset.isUIA()) {
                msg.donates_uia += parseInt(asset.amountFloat);
            } else {
                asset = asset.plus(Asset(msg.donates));
                msg.donates = asset.toString();
            }
            return Object.assign({}, state, {
                content: content,
                responses: responses,
                processing: {
                    errors: state.processing.errors,
                    votes: state.processing.votes,
                    donates: state.processing.donates
                }
            });
        }
        case types.POST_DONATE_RESOLVED_ERROR: {
            return Object.assign({}, state, {
                processing: {
                    errors: setError(state, 'donate', action.response),
                    votes: state.processing.votes,
                    donates: completeProcessing(state.processing.donates, action.response.payload)
                }
            });
        }
        case types.POST_DONATE_RESOLVED_ERROR_CLEAR: {
            return Object.assign({}, state, {
                processing: {
                    errors: false,
                    votes: state.processing.votes,
                    donates: state.processing.donates
                }
            });
        }
        default:
            return state;
    }
}

function setError(state, type, response) {
    let errors = state.processing.errors,
        id = response.payload.author + '/' + response.payload.permlink;
    console.error(response.error);
    errors[type + '-' + id] = response.error;
    return errors;
}

/*function setResponseVote(state, payload) {
    let id = payload.author + '/' + payload.permlink,
        weight = payload.weight,
        voter = payload.account.name,
        { authors, responses } = state;
    // Update any replies
    Object.keys(authors).forEach((author) => {
        if (authors[author].replies) {
            authors[author].replies.forEach((set, key) => {
                const { reply } = set;
                if (reply._id === id) {
                  authors[author].replies[key].reply.votes[voter] = weight;
                }
            });
        }
    })
    // Update any responses
    responses.forEach((item, key) => {
        if (item._id === id) {
             responses[key].votes[voter] = weight;
        }
    });
    return responses;
}*/

function completeProcessing(state, payload) {
    let processing = state,
        index = processing.indexOf(payload.author + '/' + payload.permlink);
    processing.splice(index, 1);
    return processing;
}
