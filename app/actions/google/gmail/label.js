import { remote } from 'electron'
import ActionType from '../../ActionType'

const LabelAPI = remote.require('./utils/google/gmail/LabelAPI')

export const loadAll = () => dispatch => {
  dispatch({ type: ActionType.Google.Gmail.Label.FETCH_ALL_REQUEST })

  LabelAPI.list()
}

export const create = labelName => dispatch => {
  dispatch({ type: ActionType.Google.Gmail.Label.CREATE_REQUEST, labelName })

  LabelAPI.create(labelName)
}
