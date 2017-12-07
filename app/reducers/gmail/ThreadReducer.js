import ActionType from '../../actions/ActionType'

module.exports = (threadsByID = {}, action) => {
  switch (action.type) {
    case ActionType.Google.Gmail.Thread.FETCH_REQUEST:
      // To prevent double fetching, store a null entry when we start loading
      return {
        ...threadsByID,
        [action.threadID]: threadsByID[action.threadID] || null,
      };

    case ActionType.Google.Gmail.Thread.FETCH_SUCCESS:
      return {
        ...threadsByID,
        [action.thread.id]: action.thread,
      };

    case ActionType.Google.Gmail.Thread.FETCH_LIST_SUCCESS:
      return action.threads.reduce(
        (newThreadsByID, message) => {
          newThreadsByID[message.id] = message
          return newThreadsByID;
        },
        {...threadsByID}
      );
  }
  return threadsByID;
};
