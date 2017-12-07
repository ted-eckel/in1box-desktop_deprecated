import { combineReducers } from 'redux'
import ActionType from '../../actions/ActionType'

import ItemListReducer from './ItemListReducer'
import AppReducer from './AppReducer'

const itemsByIDReducer = (itemsByID = {}, action) => {
  switch (action.type) {
    case ActionType.Pocket.Items.FETCH_SUCCESS:
      return action.items.reduce(
        (newItemsByID, item) => {
          newItemsByID[item.id] = item
          return newItemsByID
        },
        { ...itemsByID },
      )
    default:
      return itemsByID
  }
}

const isFetchingReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.Pocket.Items.FETCH_REQUEST:
      return true
    case ActionType.Pocket.Items.FETCH_SUCCESS:
      return false
    case ActionType.Pocket.Items.FETCH_FAILURE:
      return false
    default:
      return state
  }
}

const errorReducer = (state = null, action) => {
  switch (action.type) {
    case ActionType.Pocket.Items.FETCH_FAILURE:
      return action.error
    default:
      return state
  }
}

const endOfListReducer = (state = false, action) => {
  switch (action.type) {
    case ActionType.Pocket.Items.END_OF_LIST:
      return true
    default:
      return state
  }
}

const authorizationReducer = (state = {
  isAuthorized: null,
  isAuthorizing: false
}, action) => {
  switch (action.type) {
    case ActionType.Pocket.Authorization.REQUEST:
      return {
        ...state,
        isAuthorizing: true,
      }
    case ActionType.Pocket.Authorization.SUCCESS:
      return {
        ...state,
        isAuthorized: true,
        isAuthorizing: false,
      }
    case ActionType.Pocket.Authorization.FAILURE:
      return {
        ...state,
        isAuthorized: false,
        isAuthorizing: false,
      }
    default:
      return state
  }
}

export default combineReducers({
  app: AppReducer,
  itemsByID: itemsByIDReducer,
  itemListBySearch: ItemListReducer,
  isFetching: isFetchingReducer,
  error: errorReducer,
  endOfList: endOfListReducer,
  authorization: authorizationReducer,
})
