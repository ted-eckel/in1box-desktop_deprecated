/** @flow */
import { gmail as gmailAPI } from 'googleapis'
import Batchelor from 'batchelor'
import map from 'lodash/map'
import ActionType from '../../../actions/ActionType'
import translateMessage from './MessageTranslator'
import { dispatch } from '../../index'

const gmail = gmailAPI('v1')

export function getByID(options: {id: string}) {
  gmail.users.threads.get({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.id,
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.FETCH_FAILURE, error: err })
    } else {
      const { threads, messages } = processThreadResults([res])
      dispatch({
        type: ActionType.Google.Gmail.Thread.FETCH_SUCCESS,
        thread: threads[0],
        messages
      })
    }
  })
}

export const list = options => {
  let label = null
  if (!options.query) { label = 'INBOX' }

  gmail.users.threads.list({
    auth: global.oauth2Client,
    userId: 'me',
    maxResults: options.maxResults,
    labelIds: label,
    q: options.query || null,
    pageToken: options.pageToken || null,
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.FETCH_LIST_FAILURE, error: err })
    } else {
      const threadIDs = (res.threads || []).map(m => m.id)

      if (!threadIDs.length) {
        dispatch({
          type: ActionType.Google.Gmail.Thread.FETCH_LIST_SUCCESS,
          nextPageToken: null,
          resultSizeEstimate: 0,
          threads: [],
          messages: [],
        })
      }

      const threadBatch = new Batchelor({
        uri: 'https://www.googleapis.com/batch',
        method: 'POST',
        auth: {
          bearer: [global.oauth2Client.credentials.access_token]
        },
        headers: {
          'Content-Type': 'multipart/mixed'
        }
      })

      threadIDs.forEach(id => {
        // batch.add({
        threadBatch.add({
          method: 'GET',
          path: `/gmail/v1/users/me/threads/${id}`,
          requestId: id
        })
      })

      threadBatch.run((error, batchResponse) => {
        if (error) {
          dispatch({ type: ActionType.Google.Gmail.Thread.FETCH_LIST_FAILURE, error })
        } else {
          dispatch({ type: 'threadBatch.run() batchResponse:', batchResponse })

          const results = batchResponse.parts.map(part => part.body)
          const { threads, messages } = processThreadResults(results)

          dispatch({
            type: ActionType.Google.Gmail.Thread.FETCH_LIST_SUCCESS,
            query: options.query,
            requestedResultCount: options.maxResults,
            nextPageToken: res.nextPageToken,
            resultSizeEstimate: res.resultSizeEstimate,
            threads,
            messages,
          })
        }
      })

      threadBatch.reset()
    }
  })
}

export const addLabels = (threadID, labelIDs, labelNames) => {
  const labelAddRequest = ids => {
    dispatch({ type: 'labelAddRequest ids:', ids })
    gmail.users.threads.modify({
      auth: global.oauth2Client,
      userId: 'me',
      id: threadID,
      resource: {
        addLabelIds: ids
      }
    }, (err, res) => {
      if (err) {
        dispatch({ type: "it's a labelAddRequest() error" })
        dispatch({ type: ActionType.Google.Gmail.Thread.ADD_LABELS_FAILURE, err })
      } else {
        dispatch({ type: ActionType.Google.Gmail.Thread.ADD_LABELS_SUCCESS, res })
      }
    })
  }

  if (labelNames.length) {
    const labelBatch = new Batchelor({
      uri: 'https://www.googleapis.com/batch',
      method: 'POST',
      auth: {
        bearer: [global.oauth2Client.credentials.access_token]
      },
      headers: {
        'Content-Type': 'multipart/mixed'
      }
    })

    labelNames.forEach(labelName => {
      labelBatch.add({
        method: 'POST',
        path: '/gmail/v1/users/me/labels',
        parameters: {
          'Content-Type': 'application/json;',
          body: { name: labelName }
        }
      })

      labelBatch.run((batchErr, batchRes) => {
        if (batchErr) {
          dispatch({ type: "it's a labelBatch.run error" })
          dispatch({ type: ActionType.Google.Gmail.Thread.ADD_LABELS_FAILURE, error: batchErr })
        } else {
          dispatch({ type: 'labelBatch.run batchRes', batchRes })
          const newLabelIds = labelIDs
          const createdLabels = []

          batchRes.parts.forEach(part => {
            createdLabels.push(part.body)
            newLabelIds.push(part.body.id)
          })

          labelAddRequest(newLabelIds)
        }
      })

      labelBatch.reset()
    })
  } else {
    dispatch({ type: 'error in the else statement' })
    labelAddRequest(labelIDs)
  }
}

export const removeLabel = (threadID, labelID) => {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: threadID,
    resource: {
      removeLabelIds: [labelID]
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.REMOVE_LABEL_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.REMOVE_LABEL_SUCCESS, res })
    }
  })
}

export function processThreadResults(results) {
  const allMessages = []
  const threads = results.filter(thread => thread).map(thread => {
    const messages = thread.messages.map(translateMessage)
    allMessages.push.apply(allMessages, messages)
    return {
      id: thread.id,
      messageIDs: map(messages, 'id'),
    }
  })

  return { threads, messages: allMessages }
}

export function markAsRead(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      removeLabelIds: ['UNREAD']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.MARK_AS_READ_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.MARK_AS_READ_SUCCESS, res })
    }
  })
}

export function archive(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      removeLabelIds: ['INBOX']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.ARCHIVE_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.ARCHIVE_SUCCESS, res })
    }
  })
}

export function moveToInbox(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      addLabelIds: ['INBOX']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.MOVE_TO_INBOX_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.MOVE_TO_INBOX_SUCCESS, res })
    }
  })
}

export function markAsUnread(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      addLabelIds: ['UNREAD']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.MARK_AS_UNREAD_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.MARK_AS_UNREAD_SUCCESS, res })
    }
  })
}

export function unstar(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      removeLabelIds: ['STARRED']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.UNSTAR_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.UNSTAR_SUCCESS, res })
    }
  })
}

export function star(options: {threadID: string}) {
  gmail.users.threads.modify({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
    resource: {
      addLabelIds: ['STARRED']
    }
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.STAR_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.STAR_SUCCESS, res })
    }
  })
}

export function trash(options: {threadID: string}) {
  gmail.users.threads.trash({
    auth: global.oauth2Client,
    userId: 'me',
    id: options.threadID,
  }, (err, res) => {
    if (err) {
      dispatch({ type: ActionType.Google.Gmail.Thread.TRASH_FAILURE, err })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Thread.TRASH_SUCCESS, res })
    }
  })
}
