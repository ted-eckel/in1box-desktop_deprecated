import ActionType from '../../actions/ActionType'

const pageTokenReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.Google.Drive.File.FETCH_LIST_SUCCESS:
      return action.nextPageToken
    default:
      return state
  }
}

export default pageTokenReducer
