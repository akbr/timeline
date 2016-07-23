module.exports = {
  getNextTurnTime: (times) => {
    let {start, turn, turnLength, skip} = times
    return start + (turn * turnLength) - skip
  }
}