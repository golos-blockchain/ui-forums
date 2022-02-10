import * as types from '@/actions/actionTypes';

export function setBreadcrumb(payload) {
  return {type: types.SET_BREADCRUMB, payload: payload}
}
