import { createSelector } from 'reselect'
import last from 'lodash/last'
import concat from 'lodash/concat'

export const pocketIsFetchingSelector = state => state.pocket.isFetching
export const errorSelector = state => state.pocket.error
export const pocketAuthSelector = state => state.pocket.authorization.isAuthorized
export const pocketSearchSelector = state => state.pocket.app.search
export const pocketItemListBySearchSelector = state => state.pocket.itemListBySearch
export const pocketItemsByIDSelector = state => state.pocket.itemsByID

export const drawerOpenSelector = state => state.app.drawerOpen
export const keepModalOpenSelector = state => state.app.keepModalOpen
export const createNoteModalOpenSelector = state => state.app.createNoteModalOpen

export const googleEmailSelector = state => state.settings.googleEmail
export const tagsSelector = state => state.settings.tags
export const tagsByIDSelector = state => state.settings.tagsByID

const threadListByQuerySelector = state => state.gmail.threadListByQuery
export const threadsByIDSelector = state => state.gmail.threadsByID
export const messagesByIDSelector = state => state.gmail.messagesByID
export const isAuthorizedSelector = state => state.gmail.authorization.isAuthorized
export const isAuthorizingSelector = state => state.gmail.authorization.isAuthorizing
export const labelsSelector = state => state.gmail.labels
export const searchQuerySelector = state => state.gmail.app.searchQuery

export const driveIsAuthorizedSelector = state => state.drive.authorization.isAuthorized
export const driveIsAuthorizingSelector = state => state.drive.authorization.isAuthorizing

export const gmailIsFetchingSelector = state => state.gmail.isFetching
export const driveIsFetchingSelector = state => state.drive.isFetching

export const filesInitizliedSelector = state => state.files.init
export const nextFilePathsSelector = state => state.files.nextFilePaths
export const fileSearchSelector = state => state.files.app.search
export const retrievingFilesSelector = state => state.files.isRetrieving
export const filesSearchSelector = state => state.files.app.search
export const fileListByQuerySelector = state => state.files.fileListByQuery
export const filesByPathSelector = state => state.files.filesByPath

export const createdNoteSelector = state => state.files.createdNote

export const moreFilesSelector = createSelector([
  nextFilePathsSelector,
], (
  nextFilePaths,
) => {
  if (nextFilePaths !== null && nextFilePaths.length > 0) {
    return true
  } else {
    return false
  }
})

export const filesSelector = createSelector([
  filesSearchSelector,
  fileListByQuerySelector,
  filesByPathSelector,
], (
  search,
  fileListByQuery,
  filesByPath
) => {
  const fileList = fileListByQuery[search]
  return fileList ?
    fileList.map(filePath => filesByPath[filePath]) :
    []
})

export const isFetchingSelector = createSelector([
  pocketIsFetchingSelector,
  driveIsFetchingSelector,
  gmailIsFetchingSelector,
  retrievingFilesSelector
], (
  pocketIsFetching,
  driveIsFetching,
  gmailIsFetching,
  retrievingFiles,
) => {
  let anyAreFetching = false
  if (driveIsFetching || gmailIsFetching || pocketIsFetching || retrievingFiles) {
    anyAreFetching = true
  }
  return {
    any: anyAreFetching,
    drive: driveIsFetching,
    files: retrievingFiles,
    gmail: gmailIsFetching,
    pocket: pocketIsFetching
  }
})

export const allAuthSelector = createSelector([
  pocketAuthSelector,
  isAuthorizedSelector,
  driveIsAuthorizedSelector,
  filesInitizliedSelector,
], (
  pocketAuth,
  gmailAuth,
  driveAuth,
  filesInit,
) => {
  let allAuth = null
  let countAuth = 0
  if (
    gmailAuth !== null &&
    driveAuth !== null &&
    pocketAuth !== null &&
    filesInit !== null
  ) { allAuth = true }
  if (gmailAuth === true) { countAuth += 1 }
  if (driveAuth === true) { countAuth += 1 }
  if (pocketAuth === true) { countAuth += 1 }
  if (filesInit === true) { countAuth += 1 }
  return {
    all: allAuth,
    gmail: gmailAuth,
    drive: driveAuth,
    files: filesInit,
    pocket: pocketAuth,
    count: countAuth
  }
})

export const threadsSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
  threadsByIDSelector,
], (
  searchQuery,
  threadListByQuery,
  threadsByID,
) => {
  const threadList = threadListByQuery[searchQuery]
  return threadList ?
    threadList.threadIDs.map(threadID => threadsByID[threadID]) :
    []
})

export const itemsSelector = createSelector([
  pocketSearchSelector,
  pocketItemListBySearchSelector,
  pocketItemsByIDSelector,
], (
  search,
  itemListBySearch,
  itemsByID
) => {
  const itemsList = itemListBySearch[search]
  return itemsList ?
    itemsList.itemIDs.map(itemID => itemsByID[itemID]) :
    []
})

export const appSearchSelector = state => state.app.search

export const driveQuerySelector = state => state.drive.app.searchQuery
export const driveFileListByQuerySelector = state => state.drive.fileListByQuery
export const driveFilesByIDSelector = state => state.drive.filesByID

export const allTagsSelector = createSelector([
  labelsSelector,
  tagsByIDSelector
], (
  gmailLabels,
  tagsByID
) => (
  { ...tagsByID, ...gmailLabels }
))

export const driveFilesSelector = createSelector([
  driveQuerySelector,
  driveFileListByQuerySelector,
  driveFilesByIDSelector
], (
  query,
  fileListByQuery,
  filesByID
) => {
  const fileList = fileListByQuery[query]
  return fileList ?
    fileList.fileIDs.map(fileID => filesByID[fileID]) :
    []
})

export const driveHasMoreFilesSelector = createSelector([
  driveQuerySelector,
  driveFileListByQuerySelector
], (
  query,
  fileListByQuery
) => {
  const fileList = fileListByQuery[query]
  return !fileList || !!fileList.nextPageToken
})

export const pocketHasMoreItemsSelector = createSelector([
  pocketSearchSelector,
  pocketItemListBySearchSelector,
], (
  search,
  itemListBySearch
) => {
  const itemList = itemListBySearch[search]
  return !itemList || itemList.status === 1
})

export const hasMoreThreadsSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
], (
  searchQuery,
  threadListByQuery,
) => {
  const threadList = threadListByQuery[searchQuery]
  return !threadList || !!threadList.nextPageToken
})

export const endOfListSelector = createSelector([
  pocketHasMoreItemsSelector,
  hasMoreThreadsSelector,
  driveHasMoreFilesSelector,
  moreFilesSelector,
  allAuthSelector
], (
  pocketHasMoreItems,
  gmailHasMoreThreads,
  driveHasMoreFiles,
  moreFiles,
  allAuth
) => {
  if (allAuth.pocket && pocketHasMoreItems) {
    return false
  }

  if (allAuth.gmail && gmailHasMoreThreads) {
    return false
  }

  if (allAuth.drive && driveHasMoreFiles) {
    return false
  }

  if (allAuth.files && moreFiles) {
    return false
  }

  return true
})

export const lastMessageInEachThreadSelector = createSelector([
  messagesByIDSelector,
  threadsSelector,
  googleEmailSelector,
], (
  messagesByID,
  threads,
  googleEmail,
) => {
  return threads && threads.map(
    thread => {
      let idx = 0
      const lastMessage = messagesByID[last(thread.messageIDs)]
      const from = []
      while (idx < thread.messageIDs.length) {
        const pos = thread.messageIDs.length - (1 + idx)
        const message = messagesByID[thread.messageIDs[pos]]
        const email = message.messageFrom.email
        const name = message.messageFrom.name
        if (email !== googleEmail && !lastMessage.date) {
          lastMessage.date = Date.parse(message.messageDate)
        }
        if (pos === 0 && !lastMessage.date) {
          lastMessage.date = Date.parse(lastMessage.messageDate)
        }

        if (email === googleEmail) {
          if (!from.includes('me')) {
            from.push('me')
          }
        } else {
          if (name) {
            if (!from.includes(name)) {
              from.push(name)
            }
          } else {
            if (!from.includes(email.substring(0, email.lastIndexOf('@')))) {
              from.push(email.substring(0, email.lastIndexOf('@')))
            }
          }
        }
        idx += 1
      }
      lastMessage.from = from
      return lastMessage
    }
  )
})

export const loadedThreadCountSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
], (
  searchQuery,
  threadListByQuery,
) => {
  const threadList = threadListByQuery[searchQuery]
  return threadList ? threadList.threadIDs.length : 0
})

export const getAllItemsSelector = createSelector([
  lastMessageInEachThreadSelector,
  itemsSelector,
  driveFilesSelector,
  filesSelector,
  isFetchingSelector,
  allAuthSelector,
], (
    lastMessageInEachThread,
    items,
    driveFiles,
    files,
    isFetching,
    allAuth,
  ) => {
  let driveCurrent
  let gmailCurrent
  let pocketCurrent
  let filesCurrent

  if (allAuth.all) {
    if (isFetching.pocket) {
      pocketCurrent = Object.freeze(items)
    }

    if (isFetching.gmail) {
      gmailCurrent = Object.freeze(lastMessageInEachThread)
    }

    if (isFetching.drive) {
      driveCurrent = Object.freeze(driveFiles)
    }

    if (isFetching.files) {
      filesCurrent = Object.freeze(files)
    }

    if (isFetching.any) {
      const allTheItems = concat(
        pocketCurrent,
        gmailCurrent,
        driveCurrent,
        filesCurrent,
      ).sort((a, b) => b.date - a.date)

      return allTheItems
    } else {
      pocketCurrent = null
      driveCurrent = null
      gmailCurrent = null
      filesCurrent = null
      const allTheItems = concat(
        items,
        lastMessageInEachThread,
        driveFiles,
        files,
      ).sort((a, b) => b.date - a.date)
      return allTheItems
    }
  } else {
    return []
  }
})
