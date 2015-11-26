"use strict";

var fs = require('fs'),
    url = require('url');

function DebugWindow(config) {
    this.config = config;
    console.log('DebugWindow: http://localhost:'+this.config.port+'/window/index.html');
}

DebugWindow.prototype.handle = function(req, res) {
    if ('GET' !== req.method && 'HEAD' !== req.method) {
        return false; 
    }

    var path = url.parse(req.url).pathname;
    var self = this;
    var fileMatch = path.match(/(\/|\.html|\.js|\.css?)$/);

    if (fileMatch) {
        fs.readFile(self.config.root+path, function(error, content) {
            if (error) {
                res.writeHead(500);
                res.end();
            }
            else 
            {
                var headers = { 'Content-Type': 'text/html' };

                if( fileMatch[0] === '.css'){
                   headers['Content-Type'] = "text/css"; 
                } else if( fileMatch[0] === '.js'){
                    headers['Content-Type'] = "text/javascript"; 
                }
                res.writeHead(200, headers);
                res.end(content, 'utf-8');
            }
        });
    }

    return true;
};

module.exports = DebugWindow;
