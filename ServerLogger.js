/**
 * Created by Szane on 2016/5/27.
 */
var log4js = require('log4js');

var defaultOptions = {
    level: 'DEBUG',
    config: {
        appenders: [
            {type: 'console'},
            {
                "type": "file",
                "filename": "../mp-common-util.log",
                "maxLogSize": 204800,
                "backups": 1
            }
        ]
    }
};

function initLogger(name, options) {
    if (options == null) {
        options = defaultOptions;
    }
    log4js.configure(options.config);
    var logger = log4js.getLogger(name);
    logger.setLevel(options.level);
    return logger;
}

function createLogger(name) {
    return initLogger(name, {
        level: '@@logLevel',
        config: {
            appenders: [
                {type: 'console'},
                {
                    "type": "file",
                    "filename": "../sinotrans-core.log",
                    "maxLogSize": 52100,
                    "backups": 1
                }
            ]
        }
    });
}

///-- Exports

module.exports = {
    createLogger: createLogger
};

