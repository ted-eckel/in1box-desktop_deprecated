import ActionType from '../actions/ActionType'

export default (state = { paths: null }, action) => {
  switch (action.type) {
    case ActionType.App.Setup.RECEIVE_PATHS:
      return action.path
    default:
      return state
  }
}
