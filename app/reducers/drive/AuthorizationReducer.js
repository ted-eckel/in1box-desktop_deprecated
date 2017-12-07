/** @flow */

import ActionType from '../../actions/ActionType'

export default (state = {
  isAuthorized: null,
  isAuthorizing: false,
}, action) => {
  switch (action.type) {
    case ActionType.Google.Drive.Authorization.REQUEST:
      return {
        ...state,
        isAuthorizing: true,
      }
    case ActionType.Google.Drive.Authorization.SUCCESS:
      return {
        ...state,
        isAuthorized: true,
        isAuthorizing: false,
      }
    case ActionType.Google.Drive.Authorization.FAILURE:
      return {
        ...state,
        isAuthorized: false,
        isAuthorizing: false,
      }
    default:
      return state
  }
}
