import update from 'immutability-helper';
import ttGetByKey from '../utils/ttGetByKey';

import * as types from '../actions/actionTypes';
import * as CONFIG from '../../config';

const initialState = {
  trail: [{
    name: ttGetByKey(CONFIG.FORUM, 'breadcrumb_title'),
    link: '/'
  }]
}

export default function breadcrumb(state = initialState, action) {
  switch(action.type) {
    case types.SET_BREADCRUMB:
      const payload = action.payload,
            baseTrail = initialState.trail,
            trail = update(baseTrail, {$push: payload})
      return Object.assign({}, state, {
        trail: trail
      })
    default:
      return state
  }
}
