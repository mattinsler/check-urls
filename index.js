const ms = require('ms');
const fs = require('fs');
const Nightmare = require('nightmare');

const nightmare = () => {
  return new Nightmare({
    show: false,
    waitTimeout: 5000,
    gotoTimeout: 5000,
    loadTimeout: 5000,
    executionTimeout: 5000
  });
}

function checkPage(url) {
  return nightmare()
    .goto(url)
    .end()
    .then(({ code }) => code)
    .catch(err => false);
}

function createTasks(urls) {
  return urls.map((url) => {
    const state = {
      url,
      title: url,
      state: 'pending',
      timing: { start: -1, end: -1 }
    };

    state.execute = () => {
      state.state = 'running';
      state.timing.start = Date.now();

      return checkPage(url).then((res) => {
        state.timing.end = Date.now();
        const timing = ms(state.timing.end - state.timing.start);

        if (res === false) {
          state.state = 'failure';
          state.title = `${url} - ${timing} - ERROR`;
        } else {
          state.state = Math.floor(res / 100) === 2 ? 'success' : 'failure';
          state.title = `${url} - ${timing} - ${res}`;
        }
      });
    };

    return state;
  });
}

function checkUrls(urls) {
  const tasks = createTasks(urls);
  const renderer = require('./render-state')(tasks);

  process.stdin.setRawMode(true);
  renderer.start();

  const start = Date.now();
  Promise.all(tasks.map(t => t.execute()))
  .then(() => {
    const end = Date.now();
    renderer.stop();
    process.exit();
  })
  .catch(err => console.log(err.stack))
  .then(() => process.exit());
}

module.exports = checkUrls;
