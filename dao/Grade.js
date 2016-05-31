/**
 * Created by Szane on 2016/5/27.
 */


var db = require('../db/db.js');
var Seq = require('seq');

var MAX_WAIT_MS = 18 * 60 * 60 * 1000;//最大等待时长
var UNLOAD_TIME = 5 * 60 * 60 * 1000;//卸货时间
var STATION_OPERATION_TIME = 60 * 60 * 1000;//场站操作时间
var WAIT_COST_PER_HOUR = 10;//等待时薪
var TRANS_COST_PER_KM = 6;//公里运价
var THRESHOLD = 0.625;//匹配阈值
var SPEED_PER_KM = 50;
var stations = [{
    zipcode: 111111
}, {
    zipcode: 555555
}];//先假定只有两个场站

/**
 * 获取当前时刻所有未匹配订单
 */
function getImportOrderToMatch(callback) {
    var query = "select * from order_info where order_status = 0 and order_type = 1 ";
    db.dbQuery(query, function (error, rows) {
        callback(error, rows);
    });
}
function getExportOrderToMatch(callback) {
    var query = "select * from order_info where order_status = 0 and order_type = 2 ";
    db.dbQuery(query, function (error, rows) {
        callback(error, rows);
    });
}
/**
 * 模拟获取运输距离
 */
function getDistance(start, end, callback) {
    var query = "select * from distance_info where start_zipcode = ? and end_zipcode = ? ";
    var paramsArr = [], i = 0;
    paramsArr[i++] = start;
    paramsArr[i++] = end;
    db.dbQuery(query, paramsArr, function (error, rows) {
        if (rows && rows.length > 0)
            callback(parseFloat(rows[0].distance));
    });
}
/**
 * 模拟查箱源接口(留箱？有箱？)
 */
function getBoxInfo(station, order) {
    return true;
}
/**
 * 计算调度里程
 */
function getDispatchDistance(iOrder, eOrder, station, callback) {
    var distance = 0;
    Seq().seq(function () {
        var that = this;
        getDistance(station.zipcode, iOrder.e_zipcode, function (result) {
            distance += result;
            that();
        });
    }).seq(function () {
        getDistance(station.zipcode, eOrder.s_zipcode, function (result) {
            distance += result;
            callback(distance);
        });
    });
}
/**
 * 计算重载里程
 */
function getFullLoadDistance(iOrder, eOrder, callback) {
    var distance = 0;
    Seq().seq(function () {
        var that = this;
        getDistance(0, iOrder.e_zipcode, function (result) {
            distance += result;
            that();
        });
    }).seq(function () {
        getDistance(0, eOrder.s_zipcode, function (result) {
            distance += result;
            callback(distance);
        });
    });
}
/**
 * 计算等待当量里程
 */
function getWaitDistance(iOrder, eOrder, station, callback) {
    getWaitTime(iOrder, eOrder, station, function (result) {
        callback(WAIT_COST_PER_HOUR * result / TRANS_COST_PER_KM / (60 * 60 * 1000));
    });
}
/**
 * 计算等待时间
 */
function getWaitTime(iOrder, eOrder, station, callback) {
    //计算调度里程
    var dispatch = 0;
    Seq().seq(function () {
        var that = this;
        getDispatchDistance(iOrder, eOrder, station, function (result) {
            dispatch += result;
            that();
        });
    }).seq(function () {
        //计算途中时间
        var runningTime = (dispatch / SPEED_PER_KM) * 60 * 60 * 1000;
        //计算等待时间
        var iDate = new Date(iOrder.e_datetime);
        var eDate = new Date(eOrder.s_datetime);
        var waitTime = eDate.getTime() - iDate.getTime() - UNLOAD_TIME - STATION_OPERATION_TIME - runningTime;
        callback(waitTime);
    });
}
/**
 * 判断到场时间是否匹配
 */
function isTimeMatch(waitTime) {
    return waitTime <= MAX_WAIT_MS;
}
/**
 * 计算匹配指数
 */
function getMatchGrade(iOrder, eOrder, station, callback) {
    var fullLoadDistance = 0;
    var dispatchDistance = 0;
    var waitDistance = 0;
    Seq().seq(function () {
        var that = this;
        getFullLoadDistance(iOrder, eOrder, function (result) {
            fullLoadDistance = result;
            that();
        });
    }).seq(function () {
        var that = this;
        getDispatchDistance(iOrder, eOrder, station, function (result) {
            dispatchDistance = result;
            that();
        });
    }).seq(function () {
        var that = this;
        getWaitDistance(iOrder, eOrder, station, function (result) {
            waitDistance = result;
            that();
        });
    }).seq(function () {
        var costDistance = parseFloat(dispatchDistance + fullLoadDistance + waitDistance);
        if (costDistance > 0) {
            callback(parseInt(fullLoadDistance / costDistance * 1000));
        } else {
            callback(0);
        }
    });

}

function getAvailableOrders(callback) {
    var result = {};
    var iOrders = [];
    var eOrders = [];
    Seq().seq(function () {
        //获取所有待匹配的进口单
        var that = this;
        getImportOrderToMatch(function (error, rows) {
            var importOrders = rows;
            for (var i = 0; i < importOrders.length; i++) {
                var boxRight = false;
                for (var k = 0; k < stations.length; k++) {
                    //查询箱源（fake）,箱源有效的订单保留
                    if (getBoxInfo(stations[k], importOrders[i])) {
                        boxRight = true;
                        break;
                    }
                }
                if (boxRight) {
                    iOrders.push(importOrders[i]);
                }
            }
            that();
        });
    }).seq(function () {
        //获取所有带匹配的出口单
        var that = this;
        getExportOrderToMatch(function (error, rows) {
            var exportOrders = rows;
            for (var j = 0; j < exportOrders.length; j++) {
                var boxRight = false;
                for (var k = 0; k < stations.length; k++) {
                    //查询箱源（fake）,箱源有效的订单保留
                    if (getBoxInfo(stations[k], exportOrders[j])) {
                        boxRight = true;
                        break;
                    }
                }
                if (boxRight) {
                    eOrders.push(exportOrders[j]);
                }
            }
            that();
        });
    }).seq(function () {
        result.iOrders = iOrders;
        result.eOrders = eOrders;
        callback(result);
    });
}
/**
 * 生成权矩阵
 */
function generateMatrix(iOrders, eOrders, callback) {
    var matrix = [];//权值矩阵
    Seq().seq(function () {
        var that = this;
        Seq(iOrders).seqEach(function (iOrder, i) {
            var that = this;
            var line = [];//矩阵的行
            cb(iOrder, i, function (iOrder, i) {
                Seq(eOrders).seqEach(function (eOrder, j) {
                    var that = this;
                    var waitTime = 0;
                    var maxMatch = 0;
                    cb(eOrder, j, function (eOrder, j) {
                        Seq(stations).seqEach(function (station, k) {
                            var that = this;
                            cb(station, k, function (station, k) {
                                var matchGrade = 0;
                                Seq().seq(function () {
                                    var that = this;
                                    getWaitTime(iOrder, eOrder, station, function (result) {
                                        waitTime = result;
                                        that();
                                    });
                                }).seq(function () {
                                    var that = this;
                                    if (isTimeMatch(waitTime)) {
                                        //如果时间条件允许，则计算匹配指数
                                        getMatchGrade(iOrder, eOrder, station, function (result) {
                                            matchGrade = result;
                                            //小于阈值的记为0
                                            matchGrade = matchGrade >= THRESHOLD ? matchGrade : 0;
                                            //取k个场站中最大的M值
                                            maxMatch = matchGrade > maxMatch ? matchGrade : maxMatch;
                                            that();
                                        });
                                    } else {
                                        //时间条件不合适，指数记为0
                                        that();
                                    }
                                }).seq(function () {
                                    that(null, k);
                                });
                            });
                        }).seq(function () {
                            line.push(maxMatch);
                            that(null, j);
                        });
                    });
                }).seq(function () {
                    console.log(line);
                    matrix.push(line);
                    that(null, i);
                });
            });
        }).seq(function () {
            that();
        });
    }).seq(function () {
        console.log(matrix);
        callback(matrix);
    });
}
function cb(value, i, callback) {
    callback(value, i);
}
module.exports = {
    getImportOrderToMatch: getImportOrderToMatch,
    getExportOrderToMatch: getExportOrderToMatch,
    getMatchGrade: getMatchGrade,
    getWaitTime: getWaitTime,
    isTimeMatch: isTimeMatch,
    getAvailableOrders: getAvailableOrders,
    generateMatrix: generateMatrix,
    getBoxInfo: getBoxInfo
};