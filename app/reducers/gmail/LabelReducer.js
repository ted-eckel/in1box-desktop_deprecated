/** @flow */

import ActionType from '../../actions/ActionType'

module.exports = (state = {}, action) => {
  switch (action.type) {
    case ActionType.Google.Gmail.Label.FETCH_ALL_SUCCESS:
      let labelState = {};
      action.labels.forEach(label => {
        labelState[label.id] = label
      });
      return labelState;
    case ActionType.Google.Gmail.Label.CREATE_SUCCESS:
      return {
        ...state,
        [action.label.id]: action.label
      }
  }
  return state;
}
