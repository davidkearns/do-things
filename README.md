# do-things

A node module for doing things. **do-things** provides control flow functions for working with async JavaScript. 

[`inOrder`](#inOrder)

[`inParallel`](#inParallel)

Detailed example in [example.js](/example.js)

<a name="inOrder"></a>
## inOrder(things, doIt, handleUpstreamFailure, done)
Executes the `doIt` functoin for each item in things in the order specified by the shape of `things`.

When an error occurs, before the `done` callback is called with the error, `handleUpstreamFailure` is called for each thing downstream of the failed thing. This allows you to mark series things as failed due to an upstream dependency. 

**Arguments**

* `things` - An array or object containing the things to execute the `doIt` function on. Nested objects are visited in parallel, while arrays are visisted in series. Arbitrary nesting of arrays and objects is supported.
* `doIt` - The function to execute for all things. Parameters to `doIt` include `thingName` (the object key for the thing), `thing` (the provided thing visiting in the `things` structure), and `callback`. Calling back with an error will block any downstream series visits (see `handleUpstreamFailure`) and `done` with the error. Any `things` visited in a parallel control flow will still be visited.
* `handleUpstreamFailure` - When an error is calledback from an upstream thing, each downstream series thing is visisted with the function instead of `doIt`. This allows for handling up upstream dependency failures for each thing. It is called with a `thingName` and the upstream `error`. 
* `done` - A callback function called when all things are visited with an `error` parameter if a visit to a thing has failed. It is called after `handleUpstreamFailures` for series failures. For parallel failures, it is called with the first failed parallel visit, though other parallel visits may still occur.

**Examples**

```javascsript
var Thing = require('./things.js'); // Some object to operate on

// Nested objects are visited in parallel
var someParallelThings = {
  // Objects in arrays are visited in series
  someSeriesThings: [
    {seriesThing1: new Thing()},
    {seriesThing2: new Thing()},
  ],
  parallelThing2: new Thing(),
  parallelThing3: new Thing()
};
doThings.inOrder(things, doIt, handleUpstreamFailure, done);

function doIt(thingName, thing, callback) {
  // Perform an async operation on a thing and callback optionally with an error
}

function handleUpstreamFailure(taskName, error) {
  // Handle the upstream error for the given task
}

function done(err) {
  // Handle completion with or without an error
}
```

<a name="inParallel"></a>
## inParallel(things, doIt, done)
A simple function to execute `doIt` for all `things` in parallel. Let's you reuse the object shape used by [`inOrder`](#inOrder) without the series/parallel flow control that [`inOrder`](#inOrder) provides.
