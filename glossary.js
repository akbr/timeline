var utils = require("./utils")

module.exports = {
  skip: {
    spec: {ms: "number"},
    resolve: (state, {ms}) => {
      let skip = state.times.skip + ms
      let times = Object.assign({}, state.times, {skip})
      return Object.assign({}, state, {times})
    }
  },

  skipTurn: {
    resolve: (state, {num}, now) => {
      num = num || 1
      let nextTurnTime = utils.getNextTurnTime(state.times)
      let addlSkip = nextTurnTime - now + (state.times.turnLength * (num - 1))
      let skip = state.times.skip + addlSkip
      let times = Object.assign({}, state.times, {skip})
      return Object.assign({}, state, {times})
    }
  }
}