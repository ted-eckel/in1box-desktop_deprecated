import { combineReducers } from 'redux'
import AppReducer from './AppReducer'
import AuthorizationReducer from './AuthorizationReducer'
import FileListReducer from './FileListReducer'
import FetchingReducer from './FetchingReducer'
import PageTokenReducer from './PageTokenReducer'
import FileReducer from './FileReducer'

export default combineReducers({
  app: AppReducer,
  authorization: AuthorizationReducer,
  fileListByQuery: FileListReducer,
  filesByID: FileReducer,
  isFetching: FetchingReducer,
  nextPageToken: PageTokenReducer
});
