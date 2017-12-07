import { remote } from 'electron'
import ActionType from '../ActionType'

const NoteUtil = remote.require('./utils/note')

export const createNote = (note, meta, dir, newTags = []) => (dispatch, getState) => {
  const path = getState().paths

  dispatch({
    type: ActionType.App.Notes.CREATE_NOTE_REQUEST,
    note,
    meta,
    dir,
    newTags
  })

  if (note.name) {
    return NoteUtil.createOrUpdateNote(note, meta, dir, newTags, path.USER_SETTINGS)
  }
  return NoteUtil.createNote(note, meta, dir, newTags, path.USER_SETTINGS)
  // return NoteUtil.createOrUpdateNote(note, meta, dir, newTags, path.USER_SETTINGS)
}

export const updateNote = (note, meta, dir, newTags = []) => (dispatch, getState) => {
  const path = getState().paths

  dispatch({
    type: ActionType.App.Notes.UPDATE_NOTE_REQUEST,
    note,
    meta,
    dir,
    newTags
  })

  return NoteUtil.createOrUpdateNote(note, meta, dir, newTags, path.USER_SETTINGS)
}

export const archiveNote = (noteInfo, meta, filePath) => (dispatch, getState) => {
  const path = getState().paths

  dispatch({
    type: ActionType.App.Notes.ARCHIVE_REQUEST,
    noteInfo,
    meta,
    filePath
  })

  return NoteUtil.updateNoteMeta(noteInfo, meta, [], path.USER_SETTINGS)
}

export const trashNote = (noteInfo, meta, filePath) => dispatch => {
  dispatch({
    type: ActionType.App.Notes.TRASH_REQUEST,
    filePath,
    meta,
    noteInfo
  })

  return NoteUtil.trashNote(noteInfo, meta, filePath)
}

export const openNote = item => dispatch => {
  dispatch({
    type: ActionType.App.Notes.OPEN_NOTE_REQUEST,
    item
  })

  return NoteUtil.openNote(item)
}

export const updateNoteMeta = (noteInfo, meta, newTags = []) => (dispatch, getState) => {
  const path = getState().paths
  dispatch({
    type: ActionType.App.Notes.UPDATE_NOTE_REQUEST,
    noteInfo,
    meta,
    newTags
  })

  return NoteUtil.updateNoteMeta(noteInfo, meta, newTags, path.USER_SETTINGS)
}
