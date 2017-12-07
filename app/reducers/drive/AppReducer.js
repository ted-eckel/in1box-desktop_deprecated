import ActionType from '../../actions/ActionType'

export default (state = {
  searchQuery: "mimeType != 'application/vnd.google-apps.folder' and trashed = false"
}, action) => {
  switch (action.type) {
    case ActionType.Google.Drive.App.SEARCH:
      return {
        ...state,
        searchQuery: action.searchQuery,
      }
    default:
      return state
  }
}
