import { BrowserWindow } from 'electron'
import { readFile, writeFile, mkdirSync } from 'fs'
import fetch from 'node-fetch'
import { parse } from 'url'
import { dispatch } from '../index'
import path from '../../path'
import ActionType from '../../actions/ActionType'

const redirect_uri = 'http://localhost'

export function initPocketClient() {
  getReqToken()
}

export function setPocketCredentials() {
  readFile(path.Pocket.TOKEN, (pocketErr, data) => {
    if (pocketErr) {
      dispatch({ type: ActionType.Pocket.Authorization.FAILURE, pocketErr })
    } else {
      const parsed = JSON.parse(data)
      global.pocketConsumerKey = parsed.consumer_key
      global.pocketAccessToken = parsed.access_token
      dispatch({ type: ActionType.Pocket.Authorization.SUCCESS, data: parsed })
    }
  })
}

export const initPocket = consumer_key => {
  dispatch({ type: 'consumer_key received on main', consumer_key })

  return getReqToken(consumer_key)
}

function getReqToken(consumer_key) {
  const body = JSON.stringify({
    consumer_key,
    redirect_uri
  })

  return fetch('https://getpocket.com/v3/oauth/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Accept': 'application/json'
    },
    body
  })
  .then(res => res.json())
  .then(
    res => {
      dispatch({ type: 'pocket getReqToken() fetch res', res })
      return authorize(res.code).then(
        code => {
          dispatch({ type: 'pocket authorize(res.code).then(code => {...})', code })

          return getAccessToken(JSON.stringify({ code, consumer_key }))
        },
        error => dispatch({ type: 'pocket authorize(res.code).then(error => {...})', error })
      )
    },
    err => dispatch({ type: 'pocket getReqToken() fetch err', err })
  )
}

function authorize(code) {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    })

    authWindow.loadURL(`https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=http://localhost`)
    authWindow.show()

    authWindow.on('closed', () => {
      reject(new Error('window was closed by user'))
    })

    function onCallback(url) {
      const urlParts = parse(url, true)
      const error = urlParts.query.error
      if (error !== undefined) {
        reject(error)
        authWindow.removeAllListeners('closed')
        setImmediate(() => authWindow.close())
      } else {
        resolve(code)
        authWindow.removeAllListeners('closed')
        setImmediate(() => authWindow.close())
      }
    }

    authWindow.webContents.on('will-navigate', (event, url) => {
      onCallback(url)
    })

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      onCallback(newUrl)
    })
  })
}

function getAccessToken(body) {
  return fetch('https://getpocket.com/v3/oauth/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Accept': 'application/json'
    },
    body
  })
  .then(
    res => res.json(),
    err => dispatch({ type: ActionType.Pocket.Authorization.FAILURE, err })
  )
  .then(res => {
    dispatch({ type: ActionType.Pocket.Authorization.SUCCESS, res })

    const credentials = res
    credentials.consumer_key = JSON.parse(body).consumer_key

    global.pocketConsumerKey = credentials.consumer_key
    global.pocketAccessToken = credentials.access_token


    return storeToken(JSON.stringify(credentials))
  }, err => dispatch({ type: ActionType.Pocket.Authorization.FAILURE, err }))
}

function storeToken(token) {
  try {
    mkdirSync(`${path.CREDENTIALS_DIR}pocket`)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  writeFile(path.Pocket.TOKEN, token)
  console.log(`Pocket token saved to ${path.Pocket.TOKEN}. token: ${token}`)
}

export const receiveItems = (items, search) => ({
  type: ActionType.Pocket.Items.FETCH_SUCCESS,
  search,
  status: items.status,
  items: Object.keys(items.list).map(key => {
    // const d = new Date(0)
    // d.setUTCSeconds(items.list[key].time_added)
    const d = parseInt(`${items.list[key].time_added}000`, 10)
    return {
      service: 'pocket',
      date: d,
      item: items.list[key],
      id: key
    }
  })
})

export function retrieve(data) {
  const body = JSON.stringify({
    consumer_key: global.pocketConsumerKey,
    access_token: global.pocketAccessToken,
    ...data
  })

  return fetch('https://getpocket.com/v3/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body
  })
  .then(res => res.json())
  .then(
    items => {
      return dispatch(receiveItems(items, data.search))
    },
    error => dispatch({
      type: ActionType.Pocket.Items.FETCH_FAILURE,
      error
    })
  )
}

export function modify(data, success, failure) {
  const body = JSON.stringify({
    consumer_key: global.pocketConsumerKey,
    access_token: global.pocketAccessToken,
    actions: [data]
  })

  dispatch({ type: 'inside function modify', body })

  return fetch('https://getpocket.com/v3/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body
  })
  .then(res => res.json())
  .then(
    res => dispatch({ type: success, res }),
    err => dispatch({ type: failure, err })
  )
}

export function add(data) {
  const body = JSON.stringify({
    consumer_key: global.pocketConsumerKey,
    access_token: global.pocketAccessToken,
    ...data
  })

  return fetch('https://getpocket.com/v3/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body
  })
}
