import { remote } from 'electron'
import ActionType from '../../ActionType'

const FileAPI = remote.require('./utils/google/drive/FileAPI')

export const requestFiles = (
  q = "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
  fields = 'nextPageToken, files',
  orderBy = 'modifiedTime desc',
  spaces = 'drive',
  pageSize = 20
) => (dispatch, getState) => {
  const { fileListByQuery } = getState().drive
  const fileList = fileListByQuery[q]

  let pageToken = null

  if (fileList) {
    pageToken = fileList.nextPageToken
    if (!pageToken) {
      return
    }
  }

  dispatch({
    type: ActionType.Google.Drive.File.FETCH_LIST_REQUEST,
    q,
    fields,
    orderBy,
    spaces,
    pageSize,
    pageToken
  })

  FileAPI.listFiles({
    q,
    fields,
    orderBy,
    spaces,
    pageSize,
    pageToken
  })
}
