import * as google from 'googleapis'
import { createServer } from 'http'
import { readFile, writeFile, mkdirSync } from 'fs'
import { parse as qsParse } from 'querystring'
import { parse as urlParse } from 'url'
import { dispatch } from '../index'
import ActionType from '../../actions/ActionType'
import path from '../../path'

const OAuth2 = google.auth.OAuth2

const SCOPES = [
  'profile',
  'email',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.photos.readonly'
]

export default function initClient() {
  readFile(path.Google.CLIENT_SECRET, (err, content) => {
    if (err) {
      dispatch({ type: 'GOOGLE_ERROR', err })
    } else {
      const credentials = JSON.parse(content)
      const clientSecret = credentials.installed.client_secret
      const clientId = credentials.installed.client_id

      global.oauth2Client = new OAuth2(clientId, clientSecret, 'http://localhost:8080')

      readFile(path.Google.TOKEN, (error, token) => {
        if (error) {
          getNewToken()
        } else {
          setTokenInfo(JSON.parse(token))
        }
      })
    }
  })
}

const setTokenInfo = token => {
  global.oauth2Client.credentials = token

  const oauth2 = google.oauth2({
    auth: global.oauth2Client,
    version: 'v2'
  })

  oauth2.tokeninfo({
    access_token: global.oauth2Client.credentials.access_token,
  }, (tokenErr, tokenRes) => {
    if (tokenErr) {
      refreshToken(oauth2)
    } else if (tokenRes.error_description) {
      refreshToken(oauth2)
    } else {
      authorize(tokenRes)
    }
  })
}

const refreshToken = oauth2 => {
  global.oauth2Client.refreshAccessToken((refreshError, refreshedToken) => {
    if (refreshError) {
    } else {
      oauth2.tokeninfo({
        access_token: global.oauth2Client.credentials.access_token,
      }, (refreshedTokenErr, refreshedTokenRes) => {
        if (refreshedTokenErr) {
        } else {
          authorize(refreshedTokenRes)
        }
      })
    }
  })
}

const authorize = tokenRes => {
  if (tokenRes.email) {
    dispatch({
      type: ActionType.App.Settings.RECEIVE_GOOGLE_EMAIL,
      googleEmail: tokenRes.email,
    })
  }

  if (tokenRes.scope) {
    if (tokenRes.scope.includes('https://mail.google.com/')) {
      dispatch({ type: ActionType.Google.Gmail.Authorization.SUCCESS })
    } else {
      dispatch({ type: ActionType.Google.Gmail.Authorization.FAILURE })
    }

    if (checkInclusion(tokenRes.scope, [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata',
      'https://www.googleapis.com/auth/drive.photos.readonly'
    ])) {
      dispatch({ type: ActionType.Google.Drive.Authorization.SUCCESS })
    } else {
      dispatch({ type: ActionType.Google.Drive.Authorization.FAILURE })
    }
  }
}

const checkInclusion = (str, arr) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (str.includes(arr[i]) === false) { return false }
  }
  return true
}

function getNewToken() {
  const authUrl = global.oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  function handler(request, response, server) {
    const qs = qsParse(urlParse(request.url).query)

    global.oauth2Client.getToken(qs.code, (err, token) => {
      if (err) {
        console.error(`Error getting oAuth token: ${err}`)
      }
      global.mainWindow.loadURL(path.APP_INDEX)
      setTokenInfo(token)
      storeToken(token)
      server.close()
    })
  }

  const server = createServer((request, response) => {
    handler(request, response, server)
  }).listen(8080, () => {
    global.mainWindow.loadURL(authUrl)
  })
}

function storeToken(token) {
  try {
    mkdirSync(`${path.CREDENTIALS_DIR}google`)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  writeFile(path.Google.TOKEN, JSON.stringify(token))
}
