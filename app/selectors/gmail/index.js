import { createSelector } from 'reselect'
import last from 'lodash/last'
import concat from 'lodash/concat'

const threadListByQuerySelector = state => state.gmail.threadListByQuery
export const threadsByIDSelector = state => state.gmail.threadsByID
export const messagesByIDSelector = state => state.gmail.messagesByID
export const isAuthorizedSelector = state => state.gmail.authorization.isAuthorized
export const isAuthorizingSelector = state => state.gmail.authorization.isAuthorizing
export const labelsSelector = state => state.gmail.labels
export const searchQuerySelector = state => state.gmail.app.searchQuery

export const gmailIsFetchingSelector = state => state.gmail.isFetching

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
