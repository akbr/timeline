var onTurnD = require("./onTurn")
var onResolveD = require("./onResolve")
var utils = require("./utils")

var makeUpdate = (prep, apply, now, resolved, onResolve = onResolveD, onTurn = onTurnD) => {
  return function update (state) {
    // Prune pending actions
    let pending = state.pending.filter(x => !resolved.some(y => x.id === y.id))
    if (state.pending.length !== pending.length) {
      state = Object.assign({}, state, {pending})
    }
    pending = state.pending

    let {turn, updated} = state.times

    // Resolve the next batch or actions preceding the next turn
    let nextTurnTime = utils.getNextTurnTime(state.times)
    let batch = getBatch(pending, nextTurnTime)
    if (batch.length > 0) {
      let batchTime = batch[0].time
      batch.forEach(action => {
        state = apply(state, action, batchTime)
      })
      return update(state)
    }

    // Are their actions arising from the state?
    state = onResolve(state, apply, prep, updated)
    if (state.pending !== pending) {
      return update(state)
    }

    // Resolve next turn
    if (nextTurnTime <= now) {
      turn = turn + 1
      let turnActions = pending.filter(x => x.turn === turn)
      state = onTurn(state, apply, prep, turnActions)
      let times = Object.assign({}, state.times, {
        turn,
        updated: nextTurnTime
      })
      state = Object.assign({}, state, {times})
      return update(state)
    }

    return state
  }
}

var getBatch = (pending, time) => {
  let batch = pending
    .filter(action => action.time <= time)
    .sort((a, b) => {
      if (a.time > b.time) return 1
      if (a.time < b.time) return -1
      return 0
    })

  if (batch.length > 1) {
    let batchTime = batch[0].time
    batch = batch.filter(action => action.time === batchTime)
  }

  return batch
}

module.exports = makeUpdate