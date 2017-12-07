/** @flow */

import ActionType from '../../actions/ActionType'
import filter from 'lodash/filter'

module.exports = (messagesByID = {}, action) => {
  switch (action.type) {
    case ActionType.Google.Gmail.Thread.FETCH_SUCCESS:
    case ActionType.Google.Gmail.Thread.FETCH_LIST_SUCCESS:
      return action.messages.reduce(
        (newMessagesByID, message) => {
          newMessagesByID[message.id] = message
          return newMessagesByID;
        },
        {...messagesByID},
      );

    case ActionType.Google.Gmail.Thread.MARK_AS_READ_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: true},
        {isUnread: false},
      );

    case ActionType.Google.Gmail.Thread.MARK_AS_UNREAD_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: false},
        {isUnread: true},
      );

    case ActionType.Google.Gmail.Thread.ARCHIVE_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isInInbox: true},
        {isInInbox: false},
      );

    case ActionType.Google.Gmail.Thread.TRASH_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isInInbox: true},
        {isInInbox: false}
      );

    case ActionType.Google.Gmail.Thread.STAR_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: false},
        {isStarred: true},
      );

    case ActionType.Google.Gmail.Thread.UNSTAR_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: true},
        {isStarred: false},
      );
  }
  return messagesByID;
};

function _updateMessagesWhere(messagesByID, where, updates) {
  const newMessagesByID = {...messagesByID};
  const updatedMessages = filter(messagesByID, where)
    .map(message => ({...message, ...updates}))
    .forEach(message => newMessagesByID[message.id] = message);

  return newMessagesByID;
}
