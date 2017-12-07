import { mkdirSync, readFile, writeFile, existsSync } from 'fs'
// import { StringDecoder } from 'string_decoder'
import ActionType from '../actions/ActionType'
import initGoogleClient from './google'
import { initPocketClient, setPocketCredentials } from './pocket'
import { initFiles } from './files'
import path from '../path'

// const decoder = new StringDecoder('utf8')

export function initApp() {
  dispatch({ type: ActionType.App.Setup.RECEIVE_PATHS, path })
  dispatch({ type: ActionType.App.Setup.CHECK_APP_DATA_FOLDER })

  try {
    mkdirSync(path.APP_DATA_DIR)
    dispatch({ type: ActionType.App.Setup.MAKE_APP_DATA_FOLDER })
    makeUserSettings()
  } catch (err) {
    if (err.code === 'EEXIST') {
      dispatch({ type: ActionType.App.Setup.APP_DATA_FOLDER_EXISTS })
      checkUserSettings()
      checkCredentials()
    } else {
      dispatch({ type: ActionType.App.Setup.APP_DATA_FOLDER_ERROR })
    }
  }
}

function checkUserSettings() {
  dispatch({ type: ActionType.App.Setup.CHECK_USER_SETTINGS })

  if (existsSync(path.USER_SETTINGS)) {
    readFile(path.USER_SETTINGS, (err, data) => {
      if (err) {
        dispatch({ type: ActionType.App.Setup.USER_SETTINGS_ERROR })
      } else {
        const parsed = JSON.parse(data)
        dispatch({ type: ActionType.App.Setup.USER_SETTINGS_RETRIEVED, settings: parsed })
        initFiles(parsed.folders)
      }
    })
  } else {
    makeUserSettings()
  }
}

function makeUserSettings() {
  dispatch({ type: ActionType.App.Setup.MAKE_USER_SETTINGS })

  writeFile(
    path.USER_SETTINGS,
    JSON.stringify({
      nextTagId: 0,
      tags: [],
      folders: [path.DEFAULT_NOTES_DIR]
    }, null, 2)
  )
}

function checkCredentials() {
  dispatch({ type: ActionType.App.Setup.CHECK_CREDENTIALS_FOLDER })

  try {
    mkdirSync(path.CREDENTIALS_DIR)
    dispatch({ type: ActionType.App.Setup.MAKE_CREDENTIALS_FOLDER })
  } catch (err) {
    if (err.code === 'EEXIST') {
      dispatch({ type: ActionType.App.Setup.CREDENTIALS_FOLDER_EXISTS })

      if (existsSync(path.Google.CLIENT_SECRET)) {
        initGoogleClient()
        // dispatch({ type: ActionType.Google.Gmail.Authorization.FAILURE })
        // dispatch({ type: ActionType.Google.Drive.Authorization.FAILURE })
      }

      if (existsSync(path.Pocket.TOKEN)) {
        setPocketCredentials()
      } else {
        dispatch({ type: ActionType.Pocket.Authorization.FAILURE })
        // initPocketClient()
      }
    } else {
      dispatch({ type: ActionType.App.Setup.CREDENTIALS_FOLDER_ERROR })
    }
  }
}

export const dispatch = data => {
  global.mainWindow.webContents.send('dispatch', data)
}
