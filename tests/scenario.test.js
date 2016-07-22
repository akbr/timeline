var test = require("tape")
var timeline = require("../timeline")

var initialState = require("./scenario/state.js")
var glossary = require("./scenario/glossary.js")
var onResolve = require("./scenario/onResolve.js")

test("scenario", t => {
  let update = timeline(glossary, onResolve)
  let {state, resolved, receipt} = update(initialState, [
    {type: "buyFleets", system: 1, num: 100}, //sync
    {type: "move", from: 1, to: 2, num: 100}  //turn-based
  ])

  t.plan(6)

  t.equals(state.gold, 0)
  t.equals(state.systems[1].fleets, 100)
  t.equals(resolved.length, 1)

  setTimeout(() => {
    let result = update(state)
    t.equals(result.resolved.length, 2)
    t.equals(result.state.systems[1].fleets, 0)
    t.equals(result.state.systems[2].fleets, 50)
  }, 10)
})