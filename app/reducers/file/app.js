import ActionType from '../../actions/ActionType'

export default (state = { search: '' }, action) => {
  switch (action.type) {
    case ActionType.App.Files.SEARCH:
      return {
        ...state,
        search: action.search,
      }
    default:
      return state
  }
}
