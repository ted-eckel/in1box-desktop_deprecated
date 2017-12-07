import ActionType from '../../actions/ActionType'

export default (state = { searchQuery: '' }, action) => {
  switch (action.type) {
    case ActionType.Google.Gmail.App.SEARCH:
      return {
        ...state,
        searchQuery: action.searchQuery,
      }
    default:
      return state
  }
}
