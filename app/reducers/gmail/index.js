import { combineReducers } from 'redux'
import AppReducer from './AppReducer'
import AuthorizationReducer from './AuthorizationReducer'
import LabelReducer from './LabelReducer'
import FetchingReducer from './FetchingReducer'
import MessageReducer from './MessageReducer'
import ThreadReducer from './ThreadReducer'
import ThreadListReducer from './ThreadListReducer'

export default combineReducers({
  app: AppReducer,
  authorization: AuthorizationReducer,
  isFetching: FetchingReducer,
  labels: LabelReducer,
  messagesByID: MessageReducer,
  threadListByQuery: ThreadListReducer,
  threadsByID: ThreadReducer,
})
