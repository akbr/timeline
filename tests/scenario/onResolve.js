module.exports = function onResolve (state, apply, prep, now) {
  for (let i in state.systems) {
    let system = state.systems[i]
    if (system.fleets > 0 && system.pirates > 0) {
      let action = {type: "battle", system: i}
      state = apply(state, action, now)
    }
  }
  return state
}