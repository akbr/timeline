var test = require("tape")
var timeline = require("../timeline")

test("inits empty state", t => {
  let {state} = timeline()()
  t.ok(state)
  t.ok(state.times)
  t.deepEquals(state.pending, [])
  t.end()
})

test("prepares a basic state", t => {
  let {state, resolved} = timeline()({})
  t.deepEqual(state.pending, [])
  t.ok(state.times)
  t.end()
})

test("handles an unkown action type", t => {
  let {state, resolved, receipt} = timeline()({}, {type: "foo"})
  t.equal(resolved.length, 0)
  t.equal(receipt.length, 1)
  t.equal(receipt[0].err.type, "unknownActionType")
  t.end()
})

test("check action specs", t => {
  let glossary = {
    // Object form
    foo: {
      spec: {foo: "boolean"}
    },
    // Function form
    bar: {
      spec: (action) => {
        if (typeof(action.bar) !== "boolean") {
          throw new Error("bar should be a bool!")
        }
      }
    }
  }

  let update = timeline(glossary)

  let failFoo = update({}, {type: "foo"})
  t.equal(failFoo.resolved.length, 0)
  t.equal(failFoo.receipt[0].err.type, "wrongFormat")
  let succeedFoo = update({}, {type: "foo", foo: true})
  t.equal(succeedFoo.resolved.length, 1)

  let failBar = update({}, {type: "bar"})
  t.equal(failBar.resolved.length, 0)
  t.equal(failBar.receipt[0].err.type, "wrongFormat")
  let succeedBar = update({}, {type: "bar", bar: true})
  t.equal(succeedBar.resolved.length, 1)

  t.end()
})

test("inits an action", t => {
  let glossary = {
    foo: {
      init: (state, action) => {
        return Object.assign({}, action, {init: true})
      }
    }
  }

  let {resolved, receipt} = timeline(glossary)({}, {type: "foo"})
  t.equal(receipt[0].id, resolved[0].id)
  t.equal(receipt[0].err, undefined)
  t.equal(resolved[0].init, true)
  t.end()
})

test("check action validity", t => {
  let glossary = {
    foo: {
      check: (state, action) => {
        if (state.password !== "bar") {
          return "State password is invalid!"
        }
      }
    }
  }

  let update = timeline(glossary)
  let fail = update({}, {type: "foo"})
  t.equal(fail.resolved.length, 0)
  t.equal(fail.receipt[0].err.type, "invalid")
  let succeed = update({password: "bar"}, {type: "foo"})
  t.equal(succeed.resolved.length, 1)

  t.end()
})

test("multiple sync resolves", t => {
  let glossary = {
    inc: {
      spec: {amt: "number"},
      init: (state, action) => {
        if (action.jackpot) {
          return Object.assign({}, action, {amt: action.amt * 100})
        } else {
          return action
        }
      },
      check: (state, {amt}) => {
        if (amt > 100) {
          return "too much!"
        }
      },
      resolve: (state, action) => {
        let amt
        amt = state.bank ? state.bank : 0
        return Object.assign({}, state, {
          bank: amt + action.amt
        })
      }
    }
  }

  let {state, resolved, receipt} = timeline(glossary)({}, [
    {type: "inc", amt: 1},
    {type: "inc", amt: 1},
    {type: "inc", amt: 1, jackpot: true}, // should initialize to amt:100
    {type: "inc", amt: 101}, // fails validity check
    {type: "inc"} // invalid spec
  ])

  t.equal(resolved.length, 3)
  t.equal(receipt.length, 5)
  t.equal(state.bank, 102)
  t.end()
})

test("resolves a turn", t => {
  t.plan(2)
  let {state} = timeline()({times:{turnLength:25}})
  t.ok(state)

  setTimeout(() => {
    let result = timeline()(state)
    let stateN = result.state
    t.equal(stateN.times.turn, 5)
  }, 100)
})

test("resolves a turn with actions", t => {
  let glossary = {
    spend: {
      spec: {amt: "number"},
      turn: 1,
      resolve: (state, {amt}) => {
        let newAmt = state.amt - amt
        return Object.assign({}, state, {
          amt: newAmt
        })
      }
    }
  }

  let initialState = {times: {turnLength:25}, amt: 100}
  let update = timeline(glossary)

  t.plan(5)

  let {state, receipt} = update(initialState, [
    {type: "spend", amt: 50},
    {type: "spend", amt: 50}
  ])

  t.equal(state.amt, 100)
  t.equal(state.pending.length, 2)
  t.equal(receipt.length, 2)

  setTimeout(() => {
    let result = update(state)
    t.equal(result.state.amt, 0)
    t.equal(result.resolved.length, 2)
  }, 25)
})

test("basic organic action", t => { 
  let glossary = {
    bite:{
      resolve: (state) => {
        return Object.assign({}, state, {itchy: true})
      }
    },
    scratch: {
      resolve: (state) => {
        return Object.assign({}, state, {itchy: false})
      }
    }
  }

  let onResolve = (state, apply, prep, now) => {
    if (state.itchy) state = apply(state, {type: "scratch"})
    return state
  }

  let initialState = {
    itchy: false
  }

  let {state, resolved, receipt} = timeline(glossary, onResolve)(initialState, {type: "bite"})

  t.equals(resolved.length, 2)
  t.equals(receipt.length, 1)
  t.equals(state.itchy, false)
  t.end()
})