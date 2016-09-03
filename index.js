'use strict';

var async = require('async');

module.exports = {
  inParallel: inParallel,
  inOrder: inOrder
};

function inParallel(things, doIt, done) {
  if (Array.isArray(things)) {
    async.parallel(things.map(function mapTask(thing) {
      return function arrayThing(callback) {
        allImmediate(thing, doIt, callback);
      };
    }), done);
    return;
  }

  async.parallel(Object.keys(things).map(function mapObject(taskName) {
    var thing = things[taskName];

    if (Array.isArray(thing)) {
      return function arrayThing(callback) {
        allImmediate(thing, doIt, callback);
      };
    }

    return function doingIt(callback) {
      doIt(taskName, thing, callback);
    };
  }), done);
  return;
}

function inOrder(things, doIt, upstreamDoingFailed, done) {
  if (Array.isArray(things)) {
    var fns = things.map(function mapArray(thing) {
      return function composedTask(err, cb) {
        if (err) {
          allDoingFailed(thing, err);
          cb(null, err);
          return;
        }

        inOrder(thing, doIt, upstreamDoingFailed, function onComposedTask(maybeErr) {
          cb(null, maybeErr);
        });
        return;
      };
    });

    fns[0] = fns[0].bind(null, null);

    async.waterfall(fns, function onComposedComplete(_, maybeErr) {
      done(maybeErr);
    });
    return;
  }

  async.parallel(Object.keys(things).map(function mapObject(taskName) {
    return function parallelTask(callback) {
      var thing = things[taskName];

      if (Array.isArray(thing)) {
        inOrder(thing, doIt, upstreamDoingFailed, callback);
        return;
      }
      doIt(taskName, thing, callback);
      return;
    };
  }), done);

  function allDoingFailed(thing, err) {
    if (Array.isArray(thing)) {
      thing.map(allDoingFailed);
      return;
    }
    Object.keys(thing).forEach(function forEachInObj(taskName) {
      var thing2 = thing[taskName];
      if (Array.isArray(thing2)) {
        allDoingFailed(thing2, err);
        return;
      }
      upstreamDoingFailed(taskName, new Error('Upstream error:', err));
      return;
    });
    return;
  }
}
