module.exports = function updateOnTurn (state, apply, prep, turnActions) {
  turnActions.forEach(action => {
    state = apply(state, action)
  })
  
  return state
}