# Timeline

An engine for hybrid synchronous/turn-based games.

(Not really ready for public consumption. Sorry for the shoddy docs!)

## Quickstart

``` js
import timeline from "timeline"

// Make some state
let initialState = {
  counter: 0
}

// Create a "glossary" that describes available actions 
let glossary = {
  spec: { amt: "number" },
  increment: {
    resolve: (state, action) => {
      let counter = state.counter + action.amt
      return {...state, counter} // All glossary entries must be pure
    }
  }
}

// Create an update function particular to your rules
let update = timeline(glossary)

// Update your state
let {state, resolved, receipt} = update(inititalState, [
  {type: "increment", amt: 10},
  {type: "increment", amt: 90},
  {type: "increment", amt: "FOOBAR"}
])

state.counter === 100 // true
resolved.length === 2 // true
receipt.length === 3 // true
receipt[2].err // "amt should be of type number"
```
## API
### timeline(glossary[, onResolve][, onTurn]) => update(state[, actions]) => {state, resolved, receipt}

## Concepts
### state
Reserved keys are `pending` and `times`.
Optionally, set `times.turnLength` a value in ms. (Defaults to `Infinity`.)

### actions
Reserved keys are `id`.
Use must set key `type`. User may set keys `turn` or `time`.
An action without a `time` or `turn` key will be resolved syncronously.

### glossary
Describes how different actions types are handled and resolved against the state.

A glossary is composed of of `entries`, with keys corresponding to `action` types.

### entries
Settings:
- `turn` Number, indicates the number of turns _from the turn at prep time_ to resolve
- `time` Number, indicates the number of ms _from prep time_ to resolve

Hooks (always pure functions):
- `spec` : `{key: "type", ...} or (action) => (undefined || throw)`
- `init` : `(state, action) => action`
- `check` : `(state, action) => undefined || err`
- `resolve` : `(state, action, now) => state`

### In addition to a glossary, you can control Timeleine with two custom functions:
`onResolve` : `(state, apply, prep, now) => state`
Runs between every resolved action. Useful for creating actions based on state (_e.g._, a move from a to b triggers a battle there, due to contact with the enemy).
By default, onResolve is a noop. 

`onTurn` : `(state, apply, prep, turnActions) => state`
Runs at every turn resolution. `turnActions` is an array of actions to be resolved that turn. Useful for choosing the order in which actions are resolved when a turn is up.
By default, resolves all actions in `turnActions` in order presented.

#### Each of these functions accepts two small helper functions:
`apply` : `(state, action[, time]) => state`
Immediately preps and resolves action against the state.

`prep` : `(state, actions[, time]) => state`
Preps action, moves it into the state's pending array for later resolution.

### See tests for examples.