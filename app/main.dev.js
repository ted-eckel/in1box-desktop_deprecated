/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron'
import MenuBuilder from './menu'
// import { default as appPath } from './path'

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support') // eslint-disable-line global-require
  sourceMapSupport.install()
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')() // eslint-disable-line global-require
  const path = require('path') // eslint-disable-line global-require
  const p = path.join(__dirname, '..', 'app', 'node_modules')
  require('module').globalPaths.push(p) // eslint-disable-line global-require
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer') // eslint-disable-line global-require
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ]

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log)
}

ipcMain.on('mainConsoleLog', (event, label, data) => {
  console.log(label)
  console.log(data)
  console.log('')
})

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions()
  }

  global.mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  })

  global.mainWindow.loadURL(`file://${__dirname}/app.html`)
  console.log(`global.mainWindow.loadURL(file://${__dirname}/app.html)`)

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event

  global.mainWindow.webContents.on('did-finish-load', () => {
    if (!global.mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    global.mainWindow.show()
    global.mainWindow.focus()

    // init()
  })

  global.mainWindow.on('closed', () => {
    global.mainWindow = null
  })

  const menuBuilder = new MenuBuilder(global.mainWindow)
  menuBuilder.buildMenu()
})
