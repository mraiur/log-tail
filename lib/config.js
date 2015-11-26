"use strict";

var program = require('commander')
  , fs = require('fs');

var defaultValues = {
    port: 35700
};

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
  .usage('[file]');


var parseArgv = exports.parseArgv = function(argv){
    var config = argv || {};
    program._name = 'log-tail';
    config.root = __dirname+'/../';

    for (var key in defaultValues) 
    {
        config[key] = defaultValues[key];
    }
    return config;
};