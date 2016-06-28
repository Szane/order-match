var loginServer = require('./server.js');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('server.js');
var ioMatch = require('./bl/IoMatch.js');
var distance = require('./bl/Distance.js');
var sort = require('./bl/sort.js');
(function main() {
    // var server = loginServer.createServer();
    //
    // // At last, let's rock and roll
    // server.listen(8099, function onListening() {
    //     logger.info('listening at %s', server.url);
    // });
    ioMatch.getIoMatchResult();
    // distance.initDistances();
    // sort.testSort();
})();