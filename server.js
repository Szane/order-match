/**
 * Created by Szane on 2016/5/28.
 */

var restify = require('restify');
var serverLogger = require('./ServerLogger.js');
var logger = serverLogger.createLogger('server.js');
var ioMatch = require('./bl/IoMatch.js');
var distance = require('./bl/Distance.js');

function createServer(options) {
    var server = restify.createServer({
        name: 'mp',
        version: '1.0.0'
    });

    // Clean up sloppy paths like
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());

    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));
    //server.use(roleBase.checkRolBase);
    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('client-id');
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Origin");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Credentials");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "GET");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "POST");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "PUT");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "DELETE");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Headers", "accept,api-version, content-length, content-md5,x-requested-with,content-type, date, request-id, response-time");
    server.use(restify.CORS({headers: ['auth-token'], origins: ['*']}));
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());
    server.use(restify.bodyParser({uploadDir: __dirname + '/uploads/'}));

    //server.pre(roleBase.checkAuthToken);

    var STATIS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|pdf|ico|json|wav|ogg|mp3?|xml)$/i;
    server.get(/\/apidoc\/?.*/, restify.serveStatic({
        directory: './public'
    }));
    server.get('/api/ioMatch', ioMatch.getIoMatchResult);
    server.get('/api/distance', distance.getDistance);
    server.get('/api/location', distance.getLocation);
    server.get('/api/initDistance', distance.initDistances);

    server.on('NotFound', function (req, res, next) {
        res.send(404);
        next();
    });
    return (server);
}

module.exports = {
    createServer: createServer
};