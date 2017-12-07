import { remote } from 'electron'
import ActionType from '../ActionType'

const PocketAPI = remote.require('./utils/pocket')

export const fetchItems = (search = '', requestedResultCount = 20) => (dispatch, getState) => {
  const itemList = getState().pocket.itemListBySearch[search]

  let offset = 0
  if (itemList) {
    offset = itemList.nextOffset
    const status = itemList.status
    if (status === 2) {
      return
    }
  }

  dispatch({
    type: ActionType.Pocket.Items.FETCH_REQUEST,
    search,
    requestedResultCount
  })

  return PocketAPI.retrieve({
    count: requestedResultCount,
    detailType: 'complete',
    search,
    offset
  })
}

export const initPocket = consumer_key => dispatch => {
  dispatch({ type: ActionType.Pocket.Authorization.REQUEST, consumer_key })

  return PocketAPI.initPocket(consumer_key)
}

export const archiveItem = itemID => dispatch => {
  dispatch({ type: ActionType.Pocket.Items.ARCHIVE_REQUEST, itemID })

  const date = Math.floor(Date.now() / 1000).toString()

  return PocketAPI.modify(
    { action: 'archive', item_id: itemID, time: date },
    ActionType.Pocket.Items.ARCHIVE_SUCCESS,
    ActionType.Pocket.Items.ARCHIVE_FAILURE
  )
}

export const unarchiveItem = itemID => dispatch => {
  dispatch({ type: ActionType.Pocket.Items.UNARCHIVE_REQUEST, itemID })

  const date = Math.floor(Date.now() / 1000).toString()

  return PocketAPI.modify(
    { action: 'readd', item_id: itemID, time: date },
    ActionType.Pocket.Items.UNARCHIVE_SUCCESS,
    ActionType.Pocket.Items.UNARCHIVE_FAILURE
  )
}

export const deleteItem = itemID => dispatch => {
  dispatch({ type: ActionType.Pocket.Items.DELETE_REQUEST, itemID })

  const date = Math.floor(Date.now() / 1000).toString()

  return PocketAPI.modify(
    { action: 'delete', item_id: itemID, time: date },
    ActionType.Pocket.Items.DELETE_SUCCESS,
    ActionType.Pocket.Items.DELETE_FAILURE
  )
}

export const setTags = (itemID, tagString) => dispatch => {
  dispatch({ type: ActionType.Pocket.Items.SET_TAGS_REQUEST, tagString, itemID })

  const date = Math.floor(Date.now() / 1000).toString()

  return PocketAPI.modify(
    { action: 'tags_replace', item_id: itemID, tags: tagString, time: date },
    ActionType.Pocket.Items.SET_TAGS_SUCCESS,
    ActionType.Pocket.Items.SET_TAGS_FAILURE
  )
}

export const removeTag = (itemID, tagString) => dispatch => {
  dispatch({ type: ActionType.Pocket.Items.REMOVE_TAG_REQUEST, tagString, itemID })

  const date = Math.floor(Date.now() / 1000).toString()

  return PocketAPI.modify(
    { action: 'tags_remove', item_id: itemID, tags: tagString, time: date },
    ActionType.Pocket.Items.REMOVE_TAG_SUCCESS,
    ActionType.Pocket.Items.REMOVE_TAG_FAILURE
  )
}
