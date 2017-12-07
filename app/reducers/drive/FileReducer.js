import ActionType from '../../actions/ActionType'

export default (filesByID = {}, action) => {
  switch (action.type) {
    case ActionType.Google.Drive.File.FETCH_REQUEST:
      // To prevent double fetching, store a null entry when we start loading
      return {
        ...filesByID,
        [action.fileID]: filesByID[action.fileID] || null,
      }

    case ActionType.Google.Drive.File.FETCH_SUCCESS:
      return {
        ...filesByID,
        [action.file.id]: action.file,
      }

    case ActionType.Google.Drive.File.FETCH_LIST_SUCCESS:
      return action.files.reduce(
        (newFilesByID, file) => {
          newFilesByID[file.id] = file
          return newFilesByID
        },
        { ...filesByID }
      )

    default:
      return filesByID
  }
  // return filesByID
}
