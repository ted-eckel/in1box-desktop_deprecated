import ActionType from '../../actions/ActionType'

export default (appState = { search: '' }, action) => {
  switch (action.type) {
    case ActionType.Pocket.App.SEARCH:
      return {
        ...appState,
        search: action.search,
      }
    default:
      return appState
  }
}
