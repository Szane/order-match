var loginServer = require('./server.js');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('server.js');
(function main() {
    var server = loginServer.createServer();

    // At last, let's rock and roll
    server.listen(8099, function onListening() {
        logger.info('listening at %s', server.url);
    });
})();