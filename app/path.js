import { app } from 'electron'
// const APP_DATA_DIR = `${(process.env.HOME || process.env.HOMEPATH ||
//                  process.env.USERPROFILE)}/in1box-desktop/`
const APP_DATA_DIR = `${app.getPath('appData')}/in1box-desktop/`
const CREDENTIALS_DIR = `${APP_DATA_DIR}.credentials/`
const USER_SETTINGS = `${APP_DATA_DIR}user_settings.json`
const APP_INDEX = `file://${__dirname}/app.html`
const DEFAULT_NOTES_DIR = `${APP_DATA_DIR}notes/`

export default {
  APP_DATA_DIR,
  APP_INDEX,
  CREDENTIALS_DIR,
  DEFAULT_NOTES_DIR,
  USER_SETTINGS,
  Google: {
    TOKEN: `${CREDENTIALS_DIR}google/token.json`,
    CLIENT_SECRET: `${CREDENTIALS_DIR}google/client_secret.json`
  },
  Pocket: {
    TOKEN: `${CREDENTIALS_DIR}pocket/token.json`
  },
}
