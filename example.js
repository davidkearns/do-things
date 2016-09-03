'use strict';

var doThingsInOrder = require('./index.js').inOrder;

var console = require('console');

var EE = require('events').EventEmitter;
var util = require('util');
var setTimeout = require('timers').setTimeout;

function Task(error) {
  var self = this;
  EE.call(self);

  self.start = function startTask() {
    setTimeout(function defer() {
      if (error) {
        return self.emit('error', error);
      }
      return self.emit('end');
    }, Math.random() * 5000);
  };
}

util.inherits(Task, EE);

var tasks = {
  task1: new Task(),
  task2: [
    {task21: new Task()},
    {task22: new Task(new Error('failed task'))},
    {task23: new Task()}
  ],
  task3: new Task(),
  task4: [
    {task41: [{task411: new Task()}, {task412: new Task()}]},
    {task42: [{task421: new Task()}, {task422: new Task()}]},
    {task43: [{task431a: new Task(new Error('failed task')), task431b: new Task()}, {task432: new Task()}]}
  ]
};

doThingsInOrder(
  tasks,
  function startTask(taskName, task, callback) {
    console.log('Starting', taskName);
    task.on('error', function onError(err) {
      console.log('Errored', taskName);
      callback(err);
    });
    task.on('end', function onError() {
      console.log('Suceeded', taskName);
      callback();
    });
    task.start();
  },
  function failedUpstreamTask(taskName, err) {
    console.log('Upstream errored', taskName);
  },
  function allDone(err) {
    console.log('All done', err);
  }
);
