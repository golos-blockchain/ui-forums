import * as types from './actionTypes';
import golos from 'golos-classic-js';

import * as CONFIG from '../../config';

export function moderatorHidePostForum(wif, moderator, post, forum, why = '', time = '') {
    return (dispatch: () => void) => {
        const { name } = moderator;
        let obj = {};
        obj[post.id] = why + '|' + name + '|' + time;
        dispatch({
            type: types.MODERATION_HIDE_PROCESSING,
            payload: {moderator, post},
            loading: true
        })
        golos.broadcast.customJson(wif, [name], [], "account_notes",
          JSON.stringify(['set_value', {
              account: name,
              key: 'g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidmsg.lst',
              value: JSON.stringify(obj)
          }]),
          (err, result) =>  {
              if (err) {
                  dispatch({
                      type: types.MODERATION_HIDE_RESOLVED_ERROR,
                      payload: {moderator, post, err},
                      loading: false
                  })
              } else {
                  dispatch({
                      type: types.MODERATION_HIDE_RESOLVED,
                      payload: {moderator, post},
                      loading: false
                  })
              }
          });
    };
}

export function moderatorRevealPostForum(wif, moderator, post, forum) {
    return (dispatch: () => void) => {
        const { name } = moderator;
        let obj = {};
        obj[post.id] = null;
        dispatch({
            type: types.MODERATION_REVEAL_PROCESSING,
            payload: {moderator, post},
            loading: true
        })
        golos.broadcast.customJson(wif, [name], [], "account_notes",
          JSON.stringify(['set_value', {
              account: name,
              key: 'g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidmsg.lst',
              value: JSON.stringify(obj)
          }]),
          (err, result) =>  {
              if (err) {
                  dispatch({
                      type: types.MODERATION_REVEAL_RESOLVED_ERROR,
                      payload: {moderator, post, err},
                      loading: false
                  })
              } else {
                  dispatch({
                      type: types.MODERATION_REVEAL_RESOLVED,
                      payload: {moderator, post},
                      loading: false
                  })
              }
          });
    };
}
