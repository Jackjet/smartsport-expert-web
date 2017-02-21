
const nconf = require('nconf');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const resAPI = require('xyj-res');
const router = require('./routes');
const passport = require('passport');

const logger = require('xyj-logger').Logger('server.js');

const app = express();

app.use(resAPI);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(router);


app.use((req, res) => {
  const err = new Error('Not Found');
  err.code = 99404;
  err.msg = 'Not Found';
  return res.sendStatus(404);
});
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
  const mes = {
    url: req.url,
    query: req.query,
    body: req.body,
    err,
  };
  // if you have logged in other place,please set err.ignoreConsole to ignore writing logs again
  if (!err.ignoreConsole) {
    logger.error(mes);
  }

  // set err.code & err.msg can change res message
  const errorStatus = {
    code: err.code || 99999,
    msg: err.msg || err.message || 'system error',
  };
  res.error(errorStatus);
});

logger.debug(`app is running in port ${nconf.get('port') || 3000}`);
app.listen(nconf.get('port') || 3000);

module.exports = app;
