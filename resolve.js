// resolve(action, state, glossary) => state
function resolve (action, state, glossary, now) {
  let type = action.type
  let reducer = glossary[type].resolve

  if (!reducer) {
    reducer = () => state
  }

  state = reducer(state, action, now)
  
  if (!state) {
    console.warn("Resolve function '"+ type +"'' failed to return a state!")
  }
  
  let times = Object.assign({}, state.times,  {updated: now})
  return Object.assign({}, state, {times})
}

module.exports = resolve