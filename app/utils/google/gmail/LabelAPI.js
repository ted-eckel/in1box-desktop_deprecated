/** @flow */
import { gmail as gmailAPI } from 'googleapis'
import ActionType from '../../../actions/ActionType'
import { dispatch } from '../../index'

const gmail = gmailAPI('v1')

export const list = () => {
  gmail.users.labels.list({
    auth: global.oauth2Client,
    userId: 'me'
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Label.FETCH_ALL_FAILURE, error: err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Label.FETCH_ALL_SUCCESS, labels: res.labels })
    }
  })
}

export const create = labelName => {
  gmail.users.labels.create({
    auth: global.oauth2Client,
    userId: 'me',
    label: { name: labelName }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Label.CREATE_FAILURE, error: err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Label.CREATE_SUCCESS, label: res.labels })
    }
  })
}
