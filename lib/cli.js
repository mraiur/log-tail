"use strict";

exports.run = function() {
  var config;
  try {
    config = require('./config').parseArgv(process.argv);
  } catch (e) {
    console.error(e.message || e);
    return;
  }
  
  var server = require('./server').createServer(config);
  server.listen().watch();
};
