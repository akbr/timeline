var revise = require("revise").revise

var glossary = {
  buyFleets: {
    spec: {
      "system": "number",
      "num": "number"
    },
    check: (state, {system, num}) => {
      if (!state.systems[system]) return `System ${system} does not exist.`
      if (num < 1) return "Must be a positive value."
      if (state.gold < num) return "Insufficient gold."
    },
    resolve: (state, {system, num}) => {
      let currentNum = state.systems[system].fleets || 0
      return revise(state,
        ["apply", "gold", x => x - num],
        ["set", ["systems", system, "fleets"], currentNum + num]
      )
    }
  },

  move: {
    turn: 1,
    spec: {
      from: "number",
      to: "number",
      num: "number"
    },
    check: (state, {from, to, num}) => {
      let system = state.systems[from]
      let system2 = state.systems[to]
      if (!system || !system2) return `System ${id} does not exist.`
      if (!system.fleets || system.fleets < num) return "Insufficient fleets."
    },
    resolve: (state, {from, to, num}) => {
      let currentFrom = state.systems[from].fleets
      let currentTo = state.systems[to].fleets || 0
      return revise(state,
        ["set", ["systems", from, "fleets"], currentFrom - num],
        ["set", ["systems", to, "fleets"], currentTo + num]
      )
    }
  },

  battle: {
    resolve: (state, {system}) => {
      let {fleets, pirates} = state.systems[system]
      let result = fleets - pirates
      if (result > 0) {
        fleets = result
        pirates = 0
      } else {
        pirates = -result
        fleets = 0
      }

      return revise(state,
        ["merge", ["systems", system], {fleets, pirates}]
      )
    }
  }


}

module.exports = glossary