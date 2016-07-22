var prepAction = require("./prepAction")
var resolve = require("./resolve")
var makeUpdate = require("./update")

var run = (glossary = {}, onResolve, onTurn) => (state = {}, actions = []) => {
  let now = Date.now()

  state = prepareState(state, now)

  let resolved = []
  let receipt = []

  // Two "portable functions" to avoid having to pass around glossary, resolved array, etc.
  let prep = (state, action, time = now) => {
    action = prepAction(action, state, glossary, time)
    if (action.err) {
      console.warn("Flawed action in prep!", action)
    } else {
      state = Object.assign({}, state, {pending: state.pending.concat(action)})
    }
    return state
  }

  let apply = (state, action, time = now) => {
    if (!action.id) {
      action = prepAction(action, state, glossary, time)
    }
    if (action.err) {
      console.warn("Flawed action in applicator!", action)
    } else {
      state = resolve(action, state, glossary, time)
      resolved.push(action)
    }
    return state
  }

  let update = makeUpdate(prep, apply, now, resolved, onResolve, onTurn)

  state = update(state)

  if (!Array.isArray(actions)) {
    actions = [actions]
  }

  actions.forEach(action => {
    let report = {}
    action = prepAction(action, state, glossary, now)
    if (!action.err) {
      report.id = action.id
      state = Object.assign({}, state, {pending: state.pending.concat(action)})
      state = update(state)
    } else {
      report.err = action.err
    }
    receipt.push(report)
  })

  return {state, resolved, receipt}
}

var prepareState = (state, now) => {
  if (!state.pending) {
    state = Object.assign({}, state, {pending: []})
  } else if (!Array.isArray(state.pending)) {
    throw new Error("Invalid value for state.pending. Expected array.")
  }
  
  if (!state.times || !state.times.start) {
    let defaultTimes = {
      start: now,
      updated: now,
      skip: 0,
      turn: 1,
      turnLength: Infinity
    }

    times = Object.assign(defaultTimes, state.times || {})
    state = Object.assign({}, state, {times})
  }

  return state
}

module.exports = run