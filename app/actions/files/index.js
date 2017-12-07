import { remote } from 'electron'
import ActionType from '../ActionType'

const FileAPI = remote.require('./utils/files')

export const listFiles = () => (dispatch, getState) => {
  const nextFilePaths = getState().files.nextFilePaths

  dispatch({
    type: ActionType.App.Files.RETRIEVE_REQUEST,
    nextFilePaths
  })

  return FileAPI.getMetaData(nextFilePaths)
}

export const trashFiles = files => dispatch => {
  dispatch({
    type: ActionType.App.Files.TRASH_FILES_REQUEST,
    files
  })
}

export const archiveFiles = files => dispatch => {
  dispatch({
    type: ActionType.App.Files.ARCHIVE_FILES_REQUEST,
    files
  })

  // return FileAPI.updateFilesMeta(files)
}

export const createTag = tagString => dispatch => {
  dispatch({
    type: ActionType.App.Files.CREATE_TAG_REQUEST,
    tagString
  })

  return FileAPI.createTag(tagString)
}
