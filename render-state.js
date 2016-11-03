const os = require('os');
const chalk = require('chalk');
const figures = require('figures');
const logUpdate = require('log-update');
const elegantSpinner = require('elegant-spinner');
const spinnerFrame = elegantSpinner();

const STATES = {
  'pending': {
    color: 'magenta',
    icon: figures.bullet
  },
  'running': {
    color: 'yellow'
  },
  'success': {
    color: 'green',
    icon: figures.tick
  },
  'failure': {
    color: 'red',
    icon: figures.cross
  }
};

function updateState(tasks) {
  return function() {
    const frame = spinnerFrame();

    logUpdate(
      tasks.map((task) => {
        const state = STATES[task.state];
        return chalk[state.color](
          `${state.icon || frame} ${task.title}`
        );
      }).join(os.EOL)
    );
  }
}

module.exports = function(tasks) {
  let id = null;

  return {
    start() {
      if (id) { return; }
      id = setInterval(updateState(tasks), 100);
    },
    stop() {
      if (id) {
        updateState(tasks)();
        clearInterval(id);
        id = null;
      }
    }
  };
};
