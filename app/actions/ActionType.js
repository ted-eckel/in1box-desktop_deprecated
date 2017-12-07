const ActionType = {
  App: {
    Setup: {
      RECEIVE_PATHS: '',

      CHECK_APP_DATA_FOLDER: '',
      APP_DATA_FOLDER_EXISTS: '',
      APP_DATA_FOLDER_ERROR: '',
      MAKE_APP_DATA_FOLDER: '',

      CHECK_CREDENTIALS_FOLDER: '',
      CREDENTIALS_FOLDER_EXISTS: '',
      CREDENTIALS_FOLDER_ERROR: '',
      MAKE_CREDENTIALS_FOLDER: '',

      CHECK_USER_SETTINGS: '',
      USER_SETTINGS_RETRIEVED: '',
      USER_SETTINGS_ERROR: '',
      MAKE_USER_SETTINGS: ''
    },

    Functionality: {
      SEARCH: ''
    },

    Items: {
      FETCH_SUCCESS: ''
    },

    Request: {
      START: '',
      ALL_STOPPED: ''
    },

    View: {
      TOGGLE_DRAWER: '',
      TOGGLE_LIST_TYPE: '',
      TOGGLE_KEEP_MODAL: '',
      TOGGLE_CREATE_NOTE_MODAL: '',
      TOGGLE_QUILL_MODAL: '',
      TOGGLE_POCKET_AUTH_MODAL: '',
    },

    Settings: {
      RECEIVE_SETTINGS: '',
      RECEIVE_GOOGLE_EMAIL: '',
      RECEIVE_ERRORS: ''
    },

    Uploads: {
      SET_FOLDER_ID: ''
    },

    Notes: {
      FETCH_REQUEST: '',
      FETCH_SUCCESS: '',
      FETCH_FAILURE: '',
      END_OF_LIST: '',

      ARCHIVE_REQUEST: '',
      ARCHIVE_SUCCESS: '',
      ARCHIVE_FAILURE: '',

      DELETE_REQUEST: '',
      DELETE_SUCCESS: '',
      DELETE_FAILURE: '',

      TRASH_REQUEST: '',
      TRASH_SUCCESS: '',
      TRASH_FAILURE: '',

      UNARCHIVE_REQUEST: '',
      UNARCHIVE_SUCCESS: '',
      UNARCHIVE_FAILURE: '',

      CREATE_NOTE_REQUEST: '',
      CREATE_NOTE_SUCCESS: '',
      CREATE_NOTE_FAILURE: '',

      UPDATE_NOTE_REQUEST: '',
      UPDATE_NOTE_SUCCESS: '',
      UPDATE_NOTE_FAILURE: '',

      UPLOAD_NOTES_REQUEST: '',
      UPLOAD_NOTES_SUCCESS: '',
      UPLOAD_NOTES_FAILURE: '',

      OPEN_NOTE_REQUEST: '',
      OPEN_NOTE_SUCCESS: '',
      OPEN_NOTE_FAILURE: '',

      UPDATE_CREATED_NOTE_TITLE: '',
      UPDATE_CREATED_NOTE_CONTENT: ''
    },

    Files: {
      INIT_SUCCESS: '',
      INIT_FAILURE: '',

      RETRIEVE_REQUEST: '',
      RETRIEVE_SUCCESS: '',
      RETRIEVE_FAILURE: '',

      TRASH_FILES_REQUEST: '',
      TRASH_FILES_SUCCESS: '',
      TRASH_FILES_FAILURE: '',

      ARCHIVE_FILES_REQUEST: '',
      ARCHIVE_FILES_SUCCESS: '',
      ARCHIVE_FILES_FAILURE: '',

      CREATE_TAG_REQUEST: '',
      CREATE_TAG_SUCCESS: '',
      CREATE_TAG_FAILURE: '',

      UPDATE_FILE_META_SUCCESS: '',

      SEARCH: '',
    },
  },

  Google: {
    Authorization: {
      CREDENTIALS_SET: '',
      USER_RECEIVED: ''
    },

    Drive: {
      App: {
        SEARCH: ''
      },

      Authorization: {
        REQUEST: '',
        SUCCESS: '',
        FAILURE: ''
      },

      File: {
        ARCHIVE_REQUEST: '',
        ARCHIVE_SUCCESS: '',
        ARCHIVE_FAILURE: '',

        FETCH_REQUEST: '',
        FETCH_SUCCESS: '',
        FETCH_FAILURE: '',

        FETCH_LIST_REQUEST: '',
        FETCH_LIST_SUCCESS: '',
        FETCH_LIST_FAILURE: '',

        MOVE_TO_INBOX_REQUEST: '',
        MOVE_TO_INBOX_SUCCESS: '',
        MOVE_TO_INBOX_FAILURE: '',

        REFRESH: '',

        STAR_REQUEST: '',
        STAR_SUCCESS: '',
        STAR_FAILURE: '',

        UNSTAR_REQUEST: '',
        UNSTAR_SUCCESS: '',
        UNSTAR_FAILURE: '',

        TRASH_REQUEST: '',
        TRASH_SUCCESS: '',
        TRASH_FAILURE: ''
      }
    },

    Gmail: {
      App: {
        SEARCH: ''
      },

      Authorization: {
        REQUEST: '',
        SUCCESS: '',
        FAILURE: ''
      },

      Label: {
        CREATE_REQUEST: '',
        CREATE_SUCCESS: '',
        CREATE_FAILURE: '',

        FETCH_ALL_REQUEST: '',
        FETCH_ALL_SUCCESS: '',
        FETCH_ALL_FAILURE: ''
      },

      Message: {
        SELECT: ''
      },

      Request: {
        START: '',
        ALL_STOPPED: ''
      },

      Thread: {
        ADD_LABELS_REQUEST: '',
        ADD_LABELS_SUCCESS: '',
        ADD_LABELS_FAILURE: '',

        REMOVE_LABEL_REQUEST: '',
        REMOVE_LABEL_SUCCESS: '',
        REMOVE_LABEL_FAILURE: '',

        FETCH_REQUEST: '',
        FETCH_SUCCESS: '',
        FETCH_FAILURE: '',

        FETCH_LIST_REQUEST: '',
        FETCH_LIST_SUCCESS: '',
        FETCH_LIST_FAILURE: '',

        ARCHIVE_REQUEST: '',
        ARCHIVE_SUCCESS: '',
        ARCHIVE_FAILURE: '',

        MOVE_TO_INBOX_REQUEST: '',
        MOVE_TO_INBOX_SUCCESS: '',
        MOVE_TO_INBOX_FAILURE: '',

        MARK_AS_READ_REQUEST: '',
        MARK_AS_READ_SUCCESS: '',
        MARK_AS_READ_FAILURE: '',

        MARK_AS_UNREAD_REQUEST: '',
        MARK_AS_UNREAD_SUCCESS: '',
        MARK_AS_UNREAD_FAILURE: '',

        REFRESH: '',

        STAR_REQUEST: '',
        STAR_SUCCESS: '',
        STAR_FAILURE: '',

        UNSTAR_REQUEST: '',
        UNSTAR_SUCCESS: '',
        UNSTAR_FAILURE: '',

        TRASH_REQUEST: '',
        TRASH_SUCCESS: '',
        TRASH_FAILURE: ''
      }
    }
  },

  Pocket: {
    App: {
      SEARCH: ''
    },

    Authorization: {
      REQUEST: '',
      SUCCESS: '',
      FAILURE: ''
    },

    Items: {
      FETCH_REQUEST: '',
      FETCH_SUCCESS: '',
      FETCH_FAILURE: '',
      END_OF_LIST: '',

      ARCHIVE_REQUEST: '',
      ARCHIVE_SUCCESS: '',
      ARCHIVE_FAILURE: '',

      DELETE_REQUEST: '',
      DELETE_SUCCESS: '',
      DELETE_FAILURE: '',

      UNARCHIVE_REQUEST: '',
      UNARCHIVE_SUCCESS: '',
      UNARCHIVE_FAILURE: '',

      SET_TAGS_REQUEST: '',
      SET_TAGS_SUCCESS: '',
      SET_TAGS_FAILURE: '',

      REMOVE_TAG_REQUEST: '',
      REMOVE_TAG_SUCCESS: '',
      REMOVE_TAG_FAILURE: ''
    }
  }
}

function stringify(object, str = '') {
  const dup = object

  Object.keys(dup).forEach(nextLevel => {
    if (typeof dup[nextLevel] === 'string') {
      dup[nextLevel] = `${str}.${nextLevel}`
    } else {
      let nextStr
      if (str === '') {
        nextStr = `${nextLevel}`
      } else {
        nextStr = `${str}.${nextLevel}`
      }

      stringify(dup[nextLevel], nextStr)
    }
  })

  return dup
}

export default stringify(ActionType)
