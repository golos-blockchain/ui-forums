import * as types from '../actions/actionTypes';
import update from 'immutability-helper';
import * as CONFIG from '../../config';
import ttGetByKey from '../utils/ttGetByKey';

const initialState = {
  trail: [{
    name: ttGetByKey(CONFIG.FORUM, 'short_title'),
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
