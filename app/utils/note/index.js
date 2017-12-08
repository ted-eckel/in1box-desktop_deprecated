import { convertFromHTML, convertToHTML } from 'draft-convert'
import { convertToRaw, convertFromRaw } from 'draft-js'
import { readFile, writeFile, readdir } from 'fs'
import sanitize from 'sanitize-filename'
import trash from 'trash'
import moment from 'moment'
import { dispatch } from '../dispatch'
import ActionType from '../../actions/ActionType'

export const rawContentConvert = rawContent => {
  const content = convertFromRaw(rawContent)
  return convertToHTML({
    blockToHTML: (block) => {
      if (block.type === 'todo') {
        if (block.data.checked === true) {
          return { start: '<div class="listitem checked">', end: '</div>' }
        }
        return { start: '<div class="listitem">', end: '</div>' }
      }
    }
  })(content)
}

export const htmlConvert = html => {
  const content = convertFromHTML({
    htmlToBlock: (nodeName, node) => {
      if (node.className === 'listitem checked') {
        return {
          type: 'todo',
          data: {
            checked: true
          }
        }
      }
      if (node.className === 'listitem') {
        return { type: 'todo', data: {} }
      }
    }
  })(html)

  return convertToRaw(content)
}

export const contentConvert = content => (
  convertToHTML({
    blockToHTML: (block) => {
      if (block.type === 'todo') {
        if (block.data.checked === true) {
          return { start: '<div class="listitem checked">', end: '</div>' }
        }
        return { start: '<div class="listitem">', end: '</div>' }
      }
    }
  })(content)
)

export const createOrUpdateNote = (note, meta, dir, newTags = [], path) => {
  const fileName = (
    note.name ? note.name : (
      note.title ? `${sanitize(note.title)}.html` : (
        `${moment().format('YYYY-MM-DD[T]H_mm_ss.SSSZ').replace(/\:/g, '_')}.html`
      )
    )
  )

  const successType = (
    note.name ?
    ActionType.App.Notes.UPDATE_NOTE_SUCCESS :
    ActionType.App.Notes.CREATE_NOTE_SUCCESS
  )

  if (newTags.length) {
    return readFileAsync(path)
    .then(data => JSON.parse(data))
    .then(settings => {
      const newSettings = settings
      const newTagIds = []
      newTags.forEach(tag => {
        newTagIds.push(newSettings.nextTagId)
        newSettings.tagsByID[newSettings.nextTagId] = {
          id: settings.nextTagId,
          name: tag,
          path: tag,
          parent: null
        }
        newSettings.nextTagId += 1
      })
      return { newSettings, newTagIds }
    })
    .then(obj => {
      writeJsonAsync(path, obj.newSettings)
      return obj
    })
    .then(obj => {
      const newMeta = meta
      newMeta.tagIDs = meta.tagIDs.concat(obj.newTagIds)
      return writeFileAsync(`${dir}${fileName}.html`, note.content)
      .then(() => writeJsonAsync(`${dir}.${fileName}.html.json`, newMeta))
      .then(() => dispatch({
        type: successType,
        file: {
          path: `${dir}${fileName}`,
          date: Date.now(),
          folder: dir,
          meta: newMeta,
          name: fileName,
          service: 'file'
        }
      }))
    })
  }

  return writeFileAsync(`${dir}${fileName}`, note.content)
  .then(() => writeJsonAsync(`${dir}.${fileName}.json`, meta))
  .then(() => dispatch({
    type: successType,
    file: {
      path: `${dir}${fileName}`,
      date: Date.now(),
      folder: dir,
      meta,
      name: fileName,
      service: 'file'
    }
  }))
}

const createNewTags = (settingsPath, newTags) => (
  readFileAsync(settingsPath)
  .then(data => JSON.parse(data))
  .then(settings => {
    const newSettings = settings
    const newTagIds = []
    newTags.forEach(tag => {
      newTagIds.push(newSettings.nextTagId)
      newSettings.tagsByID[newSettings.nextTagId] = {
        id: settings.nextTagId,
        name: tag,
        path: tag,
        parent: null,
      }
      newSettings.nextTagId += 1
    })
    return { newSettings, newTagIds }
  })
  .then(obj => {
    writeJsonAsync(settingsPath, obj.newSettings)
    return obj
  })
)

export const updateNoteMeta = (info, meta, newTags = [], settingsPath) => {
  if (newTags.length) {
    return createNewTags(settingsPath, newTags)
    .then(obj => {
      return readFileAsync(`${info.folder}.${info.name}.json`)
      .then(data => JSON.parse(data))
      .then(currentMeta => {
        const newMeta = currentMeta
        Object.keys(meta).forEach(key => newMeta[key] = meta[key])
        newMeta.tagIDs = meta.tagIDs.concat(obj.newTagIds)
        return writeJsonAsync(`${info.folder}.${info.name}.json`, newMeta)
        .then(meta => dispatch({
          type: ActionType.App.Files.UPDATE_FILE_META_SUCCESS,
          path: `${info.folder}${info.name}`,
          meta
        }))
      })
    })
  }
  return readFileAsync(`${info.folder}.${info.name}.json`)
  .then(data => JSON.parse(data))
  .then(currentMeta => {
    const newMeta = currentMeta
    Object.keys(meta).forEach(key => newMeta[key] = meta[key])
    return writeJsonAsync(`${info.folder}.${info.name}.json`, newMeta)
    .then(meta => dispatch({
      type: ActionType.App.Files.UPDATE_FILE_META_SUCCESS,
      path: `${info.folder}${info.name}`,
      meta
    }))
  })
}

export const trashNote = (info, meta, filePath) => {
  const filesToTrash = [filePath]
  if (meta) filesToTrash.push(`${info.folder}.${info.name}.json`)
  return trash(filesToTrash).then(() => dispatch({
    type: ActionType.App.Notes.TRASH_SUCCESS,
    filePath
  }))
}

export const openNote = item => (
  readFileAsync(item.path)
  .then(uint8 => new Buffer(uint8 || '', 'base64').toString('utf8'))
  .then(data => dispatch({
    type: ActionType.App.View.TOGGLE_CREATE_NOTE_MODAL,
    file: { ...item, content: data }
  }))
)

const readFileAsync = file => new Promise((resolve, reject) => {
  readFile(file, (err, data) => {
    if (err) return reject(err)
    resolve(data)
  })
})

const writeJsonAsync = (name, json) => new Promise((resolve, reject) => {
  writeFile(name, JSON.stringify(json, null, 2), err => {
    if (err) return reject(err)
    resolve(readFileAsync(name)
    .then(data => JSON.parse(data))
    .then(newJson => {
      return newJson
    }))
  })
})

const writeFileAsync = (path, content) => new Promise((resolve, reject) => {
  writeFile(path, content, err => {
    if (err) return reject(err)
    resolve(readFileAsync(path)
    .then(data => {
      console.log('new data:')
      console.log(data)
    }))
  })
})

const readdirAsync = folder => new Promise((resolve, reject) => {
  readdir(folder, (err, data) => {
    if (err) return reject(err)
    resolve(data)
  })
})

const findNextName = (name, dirArray, i = 0) => {
  if (dirArray.includes(`${name}.html`)) {
    return findNextName(`${name} (${i + 1})`, dirArray, (i + 1))
  }
  return `${name}.html`
}

export const createNote = (note, meta, dir, newTags = [], path) => {
  return readdirAsync(dir)
  .then(data => {
    const date = new Date(Date.now())
    const name = note.title ? `${sanitize(note.title)}` : (
      `${moment().format('YYYY-MM-DD[T]H_mm_ss.SSSZ').replace(/\:/g, '_')}`
    )
    const fileName = findNextName(name, data)

    if (newTags.length) {
      return readFileAsync(path)
      .then(data => JSON.parse(data))
      .then(settings => {
        const newSettings = settings
        const newTagIds = []
        newTags.forEach(tag => {
          newTagIds.push(newSettings.nextTagId)
          newSettings.tagsByID[newSettings.nextTagId] = {
            id: settings.nextTagId,
            name: tag,
            path: tag,
            parent: null
          }
          newSettings.nextTagId += 1
        })
        return { newSettings, newTagIds }
      })
      .then(obj => {
        writeJsonAsync(path, obj.newSettings)
        return obj
      })
      .then(obj => {
        const newMeta = meta
        newMeta.tagIDs = meta.tagIDs.concat(obj.newTagIds)
        return writeFileAsync(`${dir}${fileName}`, note.content)
        .then(() => writeJsonAsync(`${dir}.${fileName}.json`, newMeta))
        .then(() => dispatch({
          type: ActionType.App.Notes.CREATE_NOTE_SUCCESS,
          file: {
            path: `${dir}${fileName}`,
            date: Date.now(),
            folder: dir,
            meta: newMeta,
            name: fileName,
            service: 'file'
          }
        }))
      })
    }

    return writeFileAsync(`${dir}${fileName}`, note.content)
    .then(() => writeJsonAsync(`${dir}.${fileName}.json`, meta))
    .then(() => dispatch({
      type: ActionType.App.Notes.CREATE_NOTE_SUCCESS,
      file: {
        path: `${dir}${fileName}`,
        date: Date.now(),
        folder: dir,
        meta,
        name: fileName,
        service: 'file'
      }
    }))
  })
}
