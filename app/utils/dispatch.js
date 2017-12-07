export const dispatch = data => {
  global.mainWindow.webContents.send('dispatch', data)
}
