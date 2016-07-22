// prepAction(action, state, glossary, now) => action
function prepAction (action, state, glossary, now) {
  let entry, msg

  let {type} = action
  entry = glossary[type]

  // entry exists?
  if (!entry) {
    msg = "Action type '" + type + "' is missing entry"
    return handleErr(action, "unknownActionType", msg)
  }

  let {spec, init, check, turn} = entry

  // Action formatted?
  if (spec) {
    if (typeof(spec) === "function") {
      try {
        spec(action)
      } catch (e) {
        return handleErr(action, "wrongFormat", e.message)
      }
    } else {
      let key
      for (key in spec) {
        if (typeof(action[key]) !== spec[key]) {
          msg = key + " should be of type " + spec[key]
          return handleErr(action, "wrongFormat", msg)
        }
      }
    }
  }

  if (init) {
    action = init(state, action)
    if (!action) {
      throw new Error("Init for action type " +type+ " has no return.")
    }
  }

  // Action valid against state?
  if (check) {
    msg = check(state, action)
    if (msg) {
      return handleErr(action, "invalid", msg)
    }
  }

  // Extend action with relevant data
  let actionExtend = {
    id: String(Math.random()).substr(2)
  }

  if (turn) {
    actionExtend.turn = state.times.turn + turn
  } else {
    actionExtend.time = now + (entry.time || 0)
  }

  return Object.assign({}, action, actionExtend)
}

function handleErr(obj, type, msg) {
  let err = {type, msg}
  return Object.assign({}, obj, {err})
}

module.exports = prepAction