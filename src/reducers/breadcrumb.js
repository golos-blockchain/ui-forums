import update from 'immutability-helper';
import ttGetByKey from '@/utils/ttGetByKey';

import * as types from '@/actions/actionTypes';

const getInitialState = () => {
  let name = ''
  if (typeof($GLS_Config) !== 'undefined') {
    name = ttGetByKey($GLS_Config.forum, 'link_title')
  }
  return {
    trail: [{
      name,
      link: '/'
    }]
  }
}

export default function breadcrumb(state, action) {
  state = state || getInitialState()
  switch(action.type) {
    case types.SET_BREADCRUMB:
      const payload = action.payload,
            baseTrail = getInitialState().trail,
            trail = update(baseTrail, {$push: payload})
      return Object.assign({}, state, {
        trail: trail
      })
    default:
      return state
  }
}
