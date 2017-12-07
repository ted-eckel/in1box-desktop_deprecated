import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import app from './app'
import drive from './drive'
import files from './file'
import gmail from './gmail'
import pocket from './pocket'
import settings from './settings'
import paths from './paths'

export default combineReducers({
  app,
  drive,
  files,
  gmail,
  pocket,
  paths,
  router,
  settings
})
