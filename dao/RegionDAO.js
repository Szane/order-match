var db = require('../db/db.js');
var serverLogger = require('../ServerLogger.js');
var logger = serverLogger.createLogger('RegionDAO.js');

function queryRegion(params, callback) {
    var query = "select * from region where id is not null";
    var paramArray = [], i = 0;

    if (params.pid) {
        paramArray[i++] = params.pid;
        query = query + " and pid = ? ";
    }
    db.dbQuery(query, paramArray, function (error, rows) {
        logger.debug(' queryRegion ');
        return callback(error, rows);
    });


}
function query3LevelRegion(params, callback) {
    var query = " select r3.id r3_id,r3.name r3_name ,r2.id r2_id , r2.name r2_name ,r1.id r1_id ,r1.name r1_name " +
        " from region r3 left join region r2 on r3.pid = r2.id  left join region r1  on r2.pid = r1.id " +
        " where  r3.id is not null ";
    var paramArray = [], i = 0;
    if (params.regionId) {
        paramArray[i++] = params.regionId;
        query += " and r3.id = ? ";
    }
    if (params.regionName) {
        paramArray[i++] = params.regionName;
        query += " and r3.name = ? ";
    }
    db.dbQuery(query, paramArray, function (error, rows) {
        logger.debug(' query3LevelRegion ');
        return callback(error, rows);
    });
}

function query2LevelRegion(params, callback) {
    var query = " select r2.id r2_id , r2.name r2_name ,r1.id r1_id ,r1.name r1_name " +
        " from region r2 left join region r1  on r2.pid = r1.id " +
        " where r2.pid is not null and r2.id = ? ";
    var paramArray = [], i = 0;

    paramArray[i++] = params.regionId;

    db.dbQuery(query, paramArray, function (error, rows) {
        logger.debug(' query2LevelRegion ');
        return callback(error, rows);
    });
}

function query1LevelRegion(params, callback) {
    var query = " select * from region where pid =0 ";
    var paramArray = [];

    db.dbQuery(query, paramArray, function (error, rows) {
        logger.debug(' query1LevelRegion ');
        return callback(error, rows);
    });
}

function querySubRegion(params, callback) {
    var query = " select * from region where pid = ? ";
    var paramArray = [], i = 0;
    paramArray[i++] = params.pid;
    db.dbQuery(query, paramArray, function (error, rows) {
        logger.debug(' query1LevelRegion ');
        return callback(error, rows);
    });
}
module.exports = {
    queryRegion: queryRegion,
    query3LevelRegion: query3LevelRegion,
    query2LevelRegion: query2LevelRegion,
    query1LevelRegion: query1LevelRegion,
    querySubRegion: querySubRegion
};