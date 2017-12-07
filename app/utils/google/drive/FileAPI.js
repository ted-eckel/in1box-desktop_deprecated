import { drive as driveAPI } from 'googleapis'
import translateFile from './FileTranslator'
import ActionType from '../../../actions/ActionType'
import { dispatch } from '../../index'

const drive = driveAPI('v3')

export function listFiles(options) {
  drive.files.list({
    auth: global.oauth2Client,
    // corpus: options.corpus || null,
    orderBy: options.orderBy || null,
    pageSize: options.pageSize || null,
    pageToken: options.pageToken || null,
    q: options.q || null,
    spaces: options.spaces || null,
    fields: options.fields || null
  }, (err, res) => {
    if (err) {
      dispatch({
        type: ActionType.Google.Drive.File.FETCH_LIST_FAILURE,
        q: options.q || null,
        fields: options.fields || null,
        orderBy: options.orderBy || null,
        spaces: options.spaces || null,
        pageSize: options.pageSize || null,
        error: err
      })
    } else {
      dispatch({
        type: ActionType.Google.Drive.File.FETCH_LIST_SUCCESS,
        options: options.q || null,
        fields: options.fields || null,
        orderBy: options.orderBy || null,
        spaces: options.spaces || null,
        pageSize: options.pageSize || null,
        nextPageToken: res.nextPageToken,
        q: options.q || null,
        files: res.files.map(file => translateFile(file))
      })
    }
  })
}
