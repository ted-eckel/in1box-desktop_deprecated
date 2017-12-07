import ActionType from '../actions/ActionType'

export default (state = {
  folders: [],
  nextTagId: null,
  tags: [],
  tagsByID: {}
}, action) => {
  switch (action.type) {
    case ActionType.App.Setup.USER_SETTINGS_RETRIEVED:
      return {
        ...state,
        ...action.settings
      }
    case ActionType.App.Settings.RECEIVE_GOOGLE_EMAIL:
      return {
        ...state,
        googleEmail: action.googleEmail
      }
    default:
      return state
  }
}
