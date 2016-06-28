/**
 * Created by Szane on 2016/5/27.
 */


var db = require('../db/db.js');
var Seq = require('seq');
var http = require('http');
var xml2json = require('xml2json');
var config = require('../Config/Config.js');
var serverLogger = require('./../ServerLogger.js');
var logger = serverLogger.createLogger('Grade.js');
var MAX_WAIT_MS = 18 * 60 * 60 * 1000;//最大等待时长
var UNLOAD_TIME = 5 * 60 * 60 * 1000;//卸货时间
var STATION_OPERATION_TIME = 60 * 60 * 1000;//场站操作时间
var WAIT_COST_PER_HOUR = 10;//等待时薪
var TRANS_COST_PER_KM = 6;//公里运价
var THRESHOLD = 625;//匹配阈值
var SPEED_PER_KM = 50;//平均时速
var stations = config.yards;
var harbour = config.harbour;

/**
 * 获取当前时刻所有未匹配订单
 */
function getImportOrderToMatch(callback) {
    var query = "select * from order_info where order_status = 0 and order_type = 1 ";
    // var query = "select oif.*,oit.* from order_item oit left join order_info oif on oif.id = oit.order_id where oit.item_status = 0 and oif.order_type = 1 ";
    db.dbQuery(query, function (error, rows) {
        callback(error, rows);
    });
}
function getExportOrderToMatch(callback) {
    var query = "select * from order_info where order_status = 0 and order_type = 2 ";
    // var query = "select oif.*,oit.* from order_item oit left join order_info oif on oif.id = oit.order_id where oit.item_status = 0 and oif.order_type = 2 ";
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
            callback(parseFloat(rows[0].distance / 1000));
    });
}
/**
 * 根据坐标获取运输距离
 * @param params
 * @param callback
 */
function getDistanceByLoc(params, callback) {
    var query = "select * from distance_info where start_lng = ? and start_lat = ? and end_lng = ? and end_lng = ? ";
    var paramsArr = [], i = 0;
    paramsArr[i++] = params.startLng;
    paramsArr[i++] = params.startLat;
    paramsArr[i++] = params.endLng;
    paramsArr[i++] = params.endLat;
    db.dbQuery(query, paramsArr, function (error, rows) {
        if (rows && rows.length > 0)
            callback(parseFloat(rows[0].distance / 1000));
    });
}
/**
 * 模拟查箱源接口(留箱？有箱？)
 *
 */
function getBoxInfo(station, order, callback) {
    logger.info("查询场站箱源情况（暂时模拟为有箱）... ");
    var cntrYard = station.yard;
    var containerSize = order.container_size;
    var containerShape = order.container_shape;
    // var shipInfo = order.ship_biz_id;
    var shipInfo = "MSC";
    var url = "http://www.sd.sinotrans.com/CYWebService/CYWebService.asmx/CntrCountInYard?cntrYard=" + cntrYard
        + "&shipCompany=" + shipInfo + "&flagFJ=N&flagJZ=N";
    http.get(url, function (result) {
        var data = "";
        result.on('data', function (d) {
            data += d;
        }).on('end', function () {
            var resJson = xml2json.toJson(data);
            resJson = eval("(" + resJson + ")");
            var yardLocation;
            if (resJson.DataTable['diffgr:diffgram']['NewDataSet']) {
                yardLocation = resJson.DataTable['diffgr:diffgram']['NewDataSet']['YARDLOCATION'];
                if (yardLocation.length == 0) {
                    callback(false);
                }
                yardLocation.forEach(function (container) {
                    var resSize = 0;
                    var resShape = 0;
                    if (container['箱尺寸'] == 20)
                        resSize = 1;
                    if (container['箱尺寸'] == 40)
                        resSize = 2;
                    if (container['箱尺寸'] == 45)
                        resSize = 3;
                    if (container['箱尺寸'] == 53)
                        resSize = 4;
                    if (container['箱型'] == 'GP')
                        resShape = 1;
                    if (container['箱型'] == 'HQ')
                        resShape = 2;
                    if (container['箱型'] == 'OT')
                        resShape = 3;
                    if (container['箱型'] == 'RF')
                        resShape = 4;
                    if (container['箱型'] == 'TK')
                        resShape = 5;
                    if (container['箱型'] == 'FR')
                        resShape = 6;
                    if (resSize == containerSize && resShape == containerShape && parseInt(container['箱量']) > 0) {
                        callback(true);
                    }
                });
            }
            callback(false);
        });
    }).on('error', function (e) {
        callback(false);
    });
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
        getDistance(harbour.zipcode, iOrder.e_zipcode, function (result) {
            distance += result;
            that();
        });
    }).seq(function () {
        getDistance(harbour.zipcode, eOrder.s_zipcode, function (result) {
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
        logger.info("计算等待时间... ");
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
    return waitTime <= MAX_WAIT_MS && waitTime >= 0;
}
/**
 * 计算匹配指数
 */
function getMatchGrade(iOrder, eOrder, station, callback) {
    var fullLoadDistance = 0;
    var dispatchDistance = 0;
    var waitDistance = 0;
    Seq().seq(function () {
        logger.info("计算重载里程... ");
        var that = this;
        getFullLoadDistance(iOrder, eOrder, function (result) {
            fullLoadDistance = result;
            that();
        });
    }).seq(function () {
        var that = this;
        logger.info("计算调度里程... ");
        getDispatchDistance(iOrder, eOrder, station, function (result) {
            dispatchDistance = result;
            that();
        });
    }).seq(function () {
        var that = this;
        logger.info("计算等待当量里程... ");
        getWaitDistance(iOrder, eOrder, station, function (result) {
            waitDistance = result;
            that();
        });
    }).seq(function () {
        logger.info("以上，计算匹配指数... ");
        var result = 0;
        var costDistance = parseFloat(dispatchDistance + fullLoadDistance + waitDistance);
        if (costDistance > 0) {
            result = parseInt(fullLoadDistance / costDistance * 1000);
        } else {
            result = 0;
        }
        logger.info("匹配指数(进口单" + iOrder.id + ",出口单" + eOrder.id + ",场站" + station.name + ")=" + result);
        callback(result);
    });

}

function getAvailableOrders(callback) {
    var result = {};
    var iOrders = [];
    var eOrders = [];
    Seq().seq(function () {
        //获取所有待匹配的进口单
        logger.info("获取所有待匹配的进口单...");
        var that = this;
        getImportOrderToMatch(function (error, rows) {
            var importOrders = rows;
            Seq(importOrders).seqEach(function (iOrder, i) {
                var that = this;
                var boxRight = false;
                cb(iOrder, i, function (iOrder, i) {
                    // Seq().seq(function () {
                    //     var outer = this;
                    //     Seq(stations).seqEach(function (station, k) {
                    //         var that = this;
                    //         getBoxInfo(station, iOrder, function (result) {
                    //             if (result) {
                    //                 boxRight = result;
                    //                 outer();
                    //             } else {
                    //                 that(null, k);
                    //             }
                    //         });
                    //     })
                    // }).seq(function () {
                    //     if (boxRight) {
                    iOrders.push(importOrders[i]);
                    // }
                    that(null, i);
                    // });
                });
            }).seq(function () {
                that();
            });
        });
    }).seq(function () {
        //获取所有带匹配的出口单
        logger.info("获取所有待匹配的出口单...");
        var that = this;
        getExportOrderToMatch(function (error, rows) {
            var exportOrders = rows;
            Seq(exportOrders).seqEach(function (eOrder, j) {
                var that = this;
                var boxRight = false;
                cb(eOrder, j, function (eOrder, j) {
                    // Seq().seq(function () {
                    //     var outer = this;
                    //     Seq(stations).seqEach(function (station, k) {
                    //         var that = this;
                    //         getBoxInfo(station, eOrder, function (result) {
                    //             if (result) {
                    //                 boxRight = result;
                    //                 outer();
                    //             } else {
                    //                 that(null, k);
                    //             }
                    //         });
                    //     })
                    // }).seq(function () {
                    //     if (boxRight) {
                    eOrders.push(exportOrders[j]);
                    // }
                    that(null, j);
                    // });
                });
            }).seq(function () {
                that();
            });
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
    logger.info("计算权值矩阵...");
    var matrix = [];//权值矩阵
    var aimStations = [];//权值矩阵对应的场站矩阵
    if (iOrders.length > eOrders.length) {
        Seq().seq(function () {
            var that = this;
            Seq(eOrders).seqEach(function (eOrder, j) {
                var that = this;
                var line = [];//矩阵的行
                var stationLine = [];//场站矩阵的行
                cb(eOrder, j, function (eOrder, j) {
                    Seq(iOrders).seqEach(function (iOrder, i) {
                        var that = this;
                        var waitTime = 0;
                        var maxMatch = 0;
                        var maxStation = stations[0];
                        cb(iOrder, i, function (iOrder, i) {
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
                                            logger.info("时间条件允许，计算匹配指数(进口：" + iOrder.id + ",出口：" + eOrder.id
                                                + "场站：" + station.name + ")");
                                            getMatchGrade(iOrder, eOrder, station, function (result) {
                                                matchGrade = result;
                                                //小于阈值的记为0
                                                matchGrade = matchGrade >= THRESHOLD ? matchGrade : 0;
                                                //取k个场站中最大的M值
                                                if (matchGrade > maxMatch) {
                                                    maxMatch = matchGrade;
                                                    maxStation = station;
                                                }
                                                that();
                                            });
                                        } else {
                                            //时间条件不合适，指数记为0
                                            logger.info("时间条件不合适，指数记为0");
                                            that();
                                        }
                                    }).seq(function () {
                                        that(null, k);
                                    });
                                });
                            }).seq(function () {
                                line.push(maxMatch);
                                stationLine.push(maxStation);
                                that(null, i);
                            });
                        });
                    }).seq(function () {
                        matrix.push(line);
                        aimStations.push(stationLine);
                        that(null, j);
                    });
                });
            }).seq(function () {
                that();
            });
        }).seq(function () {
            callback(matrix, aimStations);
        });
    } else {
        Seq().seq(function () {
            var that = this;
            Seq(iOrders).seqEach(function (iOrder, i) {
                var that = this;
                var line = [];//矩阵的行
                var stationLine = [];//场站矩阵的行
                cb(iOrder, i, function (iOrder, i) {
                    Seq(eOrders).seqEach(function (eOrder, j) {
                        var that = this;
                        var waitTime = 0;
                        var maxMatch = 0;
                        var maxStation = stations[0];
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
                                            logger.info("时间条件允许，计算匹配指数(进口：" + iOrder.id + ",出口：" + eOrder.id
                                                + "场站：" + station.name + ")");
                                            getMatchGrade(iOrder, eOrder, station, function (result) {
                                                matchGrade = result;
                                                //小于阈值的记为0
                                                matchGrade = matchGrade >= THRESHOLD ? matchGrade : 0;
                                                //取k个场站中最大的M值
                                                if (matchGrade > maxMatch) {
                                                    maxMatch = matchGrade;
                                                    maxStation = station;
                                                }
                                                that();
                                            });
                                        } else {
                                            //时间条件不合适，指数记为0
                                            logger.info("时间条件不合适，指数记为0");
                                            that();
                                        }
                                    }).seq(function () {
                                        that(null, k);
                                    });
                                });
                            }).seq(function () {
                                line.push(maxMatch);
                                stationLine.push(maxStation);
                                that(null, j);
                            });
                        });
                    }).seq(function () {
                        matrix.push(line);
                        aimStations.push(stationLine);
                        that(null, i);
                    });
                });
            }).seq(function () {
                that();
            });
        }).seq(function () {
            // logger.info(aimStations);
            callback(matrix, aimStations);
        });
    }
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