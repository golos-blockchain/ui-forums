import * as types from '@/actions/actionTypes';

export function setStatus(payload) {
  return {
    type: types.SET_STATUS,
    payload: payload
  }
}
