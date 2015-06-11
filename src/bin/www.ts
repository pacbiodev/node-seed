/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/winston/winston.d.ts" />

/**
 * Module dependencies.
 */

import debug = require('winston');
import http = require('http');

var app = require('../app');
var config = global['config'];

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.app.port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(err) {
  if (err.syscall !== 'listen') {
    throw err;
  }

  var bind = typeof port === 'string'
                          ? 'Pipe ' + port
                          : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (err.code) {
    case 'EACCES':
      debug.error('%s requires elevated privileges', bind);
      process.exit(1);
      break;

    case 'EADDRINUSE':
      debug.error('%s is already in use', bind);
      process.exit(1);
      break;
    default:
      throw err;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
                          ? 'pipe ' + addr
                          : 'port ' + addr.port;
  debug.info('Listening on %s', bind);
}
