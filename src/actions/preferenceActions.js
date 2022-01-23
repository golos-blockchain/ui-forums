import * as types from '@/actions/actionTypes';

export function setPreference(payload) {
  return {
    type: types.SET_PREFERENCE,
    payload: payload
  }
}
