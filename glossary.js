var revise = require("revise").revise

module.exports = {
  // ---
  spend: {
    format: {
      amt: "number"
    },
    validity: ({amt}, state) => {
      if (state.banks.gold < amt) {
        return "Too little gold"
      }
    },
    resolve: ({amt}, state) => {
      return revise(state,
        ["apply", "banks.gold", x => x - amt]
      )
    }
  },
  // ---
  move: {
    turn: 1,
    format: {
      from: "number",
      to: "number",
      amt: "number"
    },
    resolve: ({from, to, amt}, state) => {
      var newFrom = (state.systems[from].fleets || 0) - amt
      var newTo = (state.systems[to].fleets || 0) + amt
      return revise(state,
        ["set", ["systems", from, "fleets"], newFrom],
        ["set", ["systems", to, "fleets"], newTo]
      )
    }
  },
  // ---
  battle: {
    format: {
      system: "string"
    },
    resolve: ({system}, state) => {
      var numFleets = state.systems[system].fleets
      var numEnemies = state.systems[system].enemies
      return revise(state,
        ["apply", ["systems", system, "fleets"], x => x - numEnemies],
        ["apply", ["systems", system, "enemies"], x => x - numFleets]
      )
    }
  },
  // ---
  skip: {
    format: {
      amt: "number"
    },
    resolve: ({amt}, state) => {
      return revise(state, ["apply", "times.skip", x => x + amt])
    }
  }
}