/** @flow */
import { remote } from 'electron'
import ActionType from '../../ActionType'

const ThreadAPI = remote.require('./utils/google/gmail/ThreadAPI')

export function load(threadID) {
  return (dispatch, getState) => {
    const { threadsByID } = getState().gmail
    if (threadsByID.hasOwnProperty(threadID)) {
      // Already loading
      return
    }

    dispatch({
      type: ActionType.Google.Gmail.Thread.FETCH_REQUEST,
      threadID,
    })

    ThreadAPI.getByID({ id: threadID })
  }
}

export const loadList = (query = '', requestedResultCount = 20) => (dispatch, getState) => {
  const { threadListByQuery } = getState().gmail
  const threadList = threadListByQuery[query]

  let pageToken = null
  if (threadList) {
    pageToken = threadList.nextPageToken
    if (!pageToken) {
      return
    }
  }

  dispatch({
    type: ActionType.Google.Gmail.Thread.FETCH_LIST_REQUEST,
    query,
    requestedResultCount,
  })

  ThreadAPI.list({
    query,
    pageToken,
    maxResults: requestedResultCount,
  })
}

export const trash = threadID => dispatch => {
  dispatch({
    type: ActionType.Google.Gmail.Thread.TRASH_REQUEST,
    threadID
  })

  ThreadAPI.trash({ threadID })
}

export function refresh() {
  return { type: ActionType.Google.Gmail.Thread.REFRESH }
}

export function markAsRead(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Google.Gmail.Thread.MARK_AS_READ_REQUEST,
      threadID,
    })

    ThreadAPI.markAsRead({ threadID })
  }
}

export function markAsUnread(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Google.Gmail.Thread.MARK_AS_UNREAD_REQUEST,
      threadID,
    })

    ThreadAPI.markAsUnread({ threadID })
  }
}

export const archive = threadID => dispatch => {
  dispatch({
    type: ActionType.Google.Gmail.Thread.ARCHIVE_REQUEST,
    threadID
  })

  ThreadAPI.archive({ threadID })
}

export function moveToInbox(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Google.Gmail.Thread.MOVE_TO_INBOX_REQUEST,
      threadID,
    })

    ThreadAPI.moveToInbox({ threadID })
  }
}

export function star(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Google.Gmail.Thread.STAR_REQUEST,
      threadID,
    })

    ThreadAPI.star({ threadID })
  }
}

export function unstar(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Google.Gmail.Thread.UNSTAR_REQUEST,
      threadID,
    })

    ThreadAPI.unstar({ threadID })
  }
}

export const addLabels = (threadID, labelIDs, labelNames) => dispatch => {
  dispatch({
    type: ActionType.Google.Gmail.Thread.ADD_LABELS_REQUEST,
    threadID,
    labelIDs,
    labelNames
  })

  ThreadAPI.addLabels(threadID, labelIDs, labelNames)
}

export const removeLabel = (threadID, labelID) => dispatch => {
  dispatch({
    type: ActionType.Google.Gmail.Thread.REMOVE_LABEL_REQUEST, threadID, labelID
  })

  ThreadAPI.removeLabel(threadID, labelID)
}
