import ActionType from '../../actions/ActionType'

export default (itemListBySearch = {}, action) => {
  const itemList = itemListBySearch[action.search]
  switch (action.type) {
    case ActionType.Pocket.Items.FETCH_REQUEST:
      if (itemList) {
        return {
          ...itemListBySearch,
          [action.search]: {
            ...itemList,
            isFetching: true,
          },
        }
      } else {
        return {
          ...itemListBySearch,
          [action.search]: {
            itemIDs: [],
            isFetching: true,
            nextOffset: 0,
            status: null
          }
        }
      }

    case ActionType.Pocket.Items.FETCH_SUCCESS:
      const newItemIDs = action.items.map(item => item.id)
      return {
        ...itemListBySearch,
        [action.search]: {
          itemIDs: [...itemList.itemIDs, ...newItemIDs],
          isFetching: false,
          nextOffset: itemList.nextOffset + 20,
          status: action.status
        }
      }

    case ActionType.Pocket.Items.ARCHIVE_REQUEST:
      return removeItem(itemListBySearch, action.itemID, /^$/)

    case ActionType.Pocket.Items.UNARCHIVE_REQUEST:
      return removeMatchingSearches(itemListBySearch, /^$/)

    case ActionType.Pocket.Items.DELETE_REQUEST:
      return removeItem(itemListBySearch, action.itemID, /^$/)

    default:
      return itemListBySearch
  }
}

function removeItem(itemListBySearch, itemIDToRemove, searchRegex) {
  return Object.keys(itemListBySearch)
    .reduce((newItemListBySearch, search) => {
      if (searchRegex.test(search)) {
        const existingItemList = itemListBySearch[search]
        const newItemIDs = existingItemList.itemIDs.filter(
          itemID => itemID !== itemIDToRemove
        )
        if (newItemIDs.length < existingItemList.itemIDs.length) {
          newItemListBySearch[search] = {
            ...existingItemList,
            itemIDs: newItemIDs,
            nextOffset: existingItemList.nextOffset - 1,
          }
        } else {
          newItemListBySearch[search] = existingItemList
        }
      }

      return newItemListBySearch
    }, {})
}

function removeMatchingSearches(itemListBySearch, searchRegex) {
  return Object.keys(itemListBySearch)
    .reduce((newItemListBySearch, search) => {
      if (!searchRegex.test(search)) {
        newItemListBySearch[search] = itemListBySearch[search]
      }

      return newItemListBySearch
    }, {})
}
