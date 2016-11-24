var http = require('http');
var fs = require('fs');
var chokidar = require('chokidar');
var debugWindow = require('./debugWindow');

function Server(config, watcher) {
    this.config = require('./config').parseArgv(config);
}

var fileRead = function(io, file, meta){
    fs.readFile(file, 'utf-8', function(error, content) {

        if (!error)
        {
            var eventData = {
                'file': file,
                'content': content,
                'meta': meta
            };

            io.emit('update', eventData);
        }
    });
};

Server.prototype.watch = function(){
    var files = this.config.slice(2);
    var io = this.io;

    var fileWatch = function(file){
        var watcher = chokidar.watch(file, {
            ignored: /[\/\\]\./, persistent: true
        });
        watcher.on('change', function(file, meta){
            fileRead(io, file, meta);
        });
        return watcher;
    };

    for(var i = 0; i < files.length; i++ ){
        fileWatch(files[i]);
    }
};

Server.prototype.listen = function(){
    var config = this.config;
    var files = this.config.slice(2);

    var handlers = [
        new debugWindow(config)
    ];

    var server = http.createServer(function(request, response) {
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].handle(request, response)) {
                return;
            }
        }
        response.writeHead(404);
        response.write("File not found");
        response.end();

    }).listen(config.port, function(){
        console.log("Listening on "+config.port);
    });

    this.io = require('socket.io')(server);
    var io = this.io;

    this.io.on('connection', function (socket) {

        for(var i = 0; i < files.length; i++ )
        {
            var fileMeta = fs.statSync( files[i] );
            fileRead(io, files[i], fileMeta);
        }

        socket.on('update', function (data) {
            socket.broadcast.emit('update', {
                message: data
            });
        });

        socket.on('disconnect', function () {

        });
    });
    return this;
};

exports.createServer = function(config) {
  var server = new Server(config || {});
  return server;
};
