import ActionType from '../actions/ActionType'

export default (state = {
  appDataFolderExists: true,
  credentialsFolderExists: true,
  createNoteModalOpen: false,
  drawerOpen: false,
  gridList: true,
  keepModalOpen: false,
  pocketAuthModalOpen: false,
  quillModalOpen: false,
  search: '',
}, action) => {
  switch (action.type) {
    case ActionType.App.View.TOGGLE_DRAWER:
      return {
        ...state,
        drawerOpen: !state.drawerOpen
      }
    case ActionType.App.View.TOGGLE_LIST_TYPE:
      return {
        ...state,
        gridList: !state.gridList
      }
    case ActionType.App.View.TOGGLE_POCKET_AUTH_MODAL:
      return {
        ...state,
        pocketAuthModalOpen: !state.pocketAuthModalOpen
      }
    case ActionType.App.View.TOGGLE_KEEP_MODAL:
      return {
        ...state,
        keepModalOpen: !state.keepModalOpen
      }
    case ActionType.App.View.TOGGLE_CREATE_NOTE_MODAL:
      return {
        ...state,
        createNoteModalOpen: !state.createNoteModalOpen
      }
    case ActionType.App.View.TOGGLE_QUILL_MODAL:
      return {
        ...state,
        quillModalOpen: !state.quillModalOpen
      }
    case ActionType.App.Functionality.SEARCH:
      return {
        ...state,
        search: action.string
      }
    case ActionType.App.Setup.APP_DATA_FOLDER_RESPONSE:
      return {
        ...state,
        appDataFolderExists: action.exists
      }
    case ActionType.App.Setup.CREDENTIALS_FOLDER_RESPONSE:
      return {
        ...state,
        credentialsFolderExists: action.exists
      }
    default:
      return state
  }
}
