// /**
//  * Created by Szane on 2016/5/27.
//  */
//
//
// var db = require('./../db/db.js');
// var Seq = require('seq');
// var self = require('./matchGrade.js');
//
// var MAX_WAIT_MS = 18 * 60 * 60 * 1000;//最大等待时长
// var UNLOAD_TIME = 5 * 60 * 60 * 1000;//卸货时间
// var STATION_OPERATION_TIME = 60 * 60 * 1000;//场站操作时间
// var WAIT_COST_PER_HOUR = 10;//等待时薪
// var TRANS_COST_PER_KM = 6;//公里运价
// var THRESHOLD = 0.625;//匹配阈值
// var SPEED_PER_KM = 50;
// var stations = [{
//     zipcode: 111111
// }, {
//     zipcode: 555555
// }];//先假定只有两个场站
//
// function grade(order) {
//     return Math.random();
// }
// /**
//  * 获取当前时刻所有未匹配订单
//  */
// function getImportOrderToMatch(callback) {
//     var query = "select * from order_info where order_status = 0 and order_type = 1 ";
//     db.dbQuery(query, function (error, rows) {
//         callback(error, rows);
//     });
// }
// function getExportOrderToMatch(callback) {
//     var query = "select * from order_info where order_status = 0 and order_type = 2 ";
//     db.dbQuery(query, function (error, rows) {
//         callback(error, rows);
//     });
// }
// /**
//  * 模拟获取运输距离
//  */
// function getDistance(start, end) {
//     var query = "select * from distance_info where start_zipcode = ? and end_zipcode = ? ";
//     var paramsArr = [], i = 0;
//     paramsArr[i++] = start;
//     paramsArr[i++] = end;
//     db.dbQuery(query, paramsArr, function (error, rows) {
//         return rows;
//     });
// }
// /**
//  * 模拟查箱源接口(留箱？有箱？)
//  */
// function getBoxInfo(station, order) {
//     return true;
// }
// /**
//  * 计算调度里程
//  * @param iOrder
//  * @param eOrder
//  * @param station
//  * @returns {*}
//  */
// function getDispatchDistance(iOrder, eOrder, station) {
//     return getDistance(station.zipcode, iOrder.end_zipcode)[0] + getDistance(station.zipcode, eOrder.start_zipcode)[0];
// }
// /**
//  * 计算重载里程
//  * @param iOrder
//  * @param eOrder
//  * @param station
//  * @returns {*}
//  */
// function getFullLoadDistance(iOrder, eOrder, station) {
//     return getDistance(0, iOrder.end_zipcode)[0] + getDistance(0, eOrder.start_zipcode)[0];
// }
// /**
//  * 计算等待当量里程
//  * @param iOrder
//  * @param eOrder
//  * @param station
//  * @returns {number}
//  */
// function getWaitDistance(iOrder, eOrder, station) {
//     var waitTime = getWaitTime(iOrder, eOrder, station);
//     return WAIT_COST_PER_HOUR * waitTime / TRANS_COST_PER_KM / (60 * 60 * 1000);
// }
// /**
//  * 计算等待时间
//  * @param iOrder
//  * @param eOrder
//  * @param station
//  * @returns {number}
//  */
// function getWaitTime(iOrder, eOrder, station) {
//     //计算调度里程
//     var dispatch = getDispatchDistance(iOrder, eOrder, station);
//     //计算途中时间
//     var runningTime = (dispatch / SPEED_PER_KM) * 60 * 60 * 1000;
//     //计算等待时间
//     return iOrder.e_datetime.getTime() - eOrder.s_datetime.getTime() - MAX_WAIT_MS - UNLOAD_TIME - STATION_OPERATION_TIME - runningTime;
// }
// /**
//  * 判断到场时间是否匹配
//  * @param waitTime
//  * @returns {boolean}
//  */
// function isTimeMatch(waitTime) {
//     return waitTime <= MAX_WAIT_MS;
// }
// /**
//  * 计算匹配指数
//  * @param iOrder
//  * @param eOrder
//  * @param station
//  * @returns {number}
//  */
// function getMatchGrade(iOrder, eOrder, station) {
//     var fullLoadDistance = getFullLoadDistance(iOrder, eOrder, station);
//     var costDistance = getDispatchDistance(iOrder, eOrder, station) + fullLoadDistance + getWaitDistance(iOrder, eOrder, station);
//     if (costDistance > 0) {
//         return fullLoadDistance / costDistance;
//     } else {
//         return 0;
//     }
// }
//
// function getAvailableOrders() {
//     var result = {};
//     var iOrders = [];
//     var eOrders = [];
//     Seq().seq(function () {
//         //获取所有待匹配的进口单
//         var that = this;
//         self.getImportOrderToMatch(function (error, rows) {
//             var importOrders = rows;
//             for (var i = 0; i < importOrders.length; i++) {
//                 for (var k = 0; k < stations.length; k++) {
//                     //查询箱源（fake）,箱源有效的订单保留
//                     if (getBoxInfo(stations[k], importOrders[i])) {
//                         iOrders.push(importOrders[i]);
//                     }
//                 }
//             }
//             that();
//         });
//     }).seq(function () {
//         //获取所有带匹配的出口单
//         var that = this;
//         self.getExportOrderToMatch(function (error, rows) {
//             var exportOrders = rows;
//             for (var j = 0; j < exportOrders.length; j++) {
//                 for (var k = 0; k < stations.length; k++) {
//                     //查询箱源（fake）,箱源有效的订单保留
//                     if (self.getBoxInfo(stations[k], exportOrders[j])) {
//                         eOrders.push(exportOrders[j]);
//                     }
//                 }
//             }
//             that();
//         });
//     }).seq(function () {
//         result.iOrders = iOrders;
//         result.eOrders = eOrders;
//         return result;
//     });
// }
// /**
//  * 生成权矩阵
//  */
// function generateMatrix(iOrders, eOrders) {
//     var matrix = [];//权值矩阵
//     for (var k = 0; k < stations.length; k++) {
//         for (var i = 0; i < iOrders.length; i++) {
//             var line = [];//矩阵的行
//             for (var j = 0; j < eOrders.length; j++) {
//                 var waitTime = getWaitTime(iOrders[i], eOrders[j], stations[k]);
//                 if (isTimeMatch(waitTime)) {
//                     //如果时间条件允许，则计算匹配指数
//                     var matchGrade = getMatchGrade(iOrders[i], eOrders[j], stations[k]);
//                     //小于阈值的记为0
//                     line.push(matchGrade >= THRESHOLD ? matchGrade : 0);
//                 } else {
//                     //时间条件不合适，指数记为0
//                     line.push(0);
//                 }
//             }
//             matrix.push(line);
//         }
//     }
//     return matrix;
// }
//
// module.exports = {
//     getImportOrderToMatch: getImportOrderToMatch,
//     getExportOrderToMatch: getExportOrderToMatch,
//     getMatchGrade: getMatchGrade,
//     getWaitTime: getWaitTime,
//     isTimeMatch: isTimeMatch,
//     getAvailableOrders: getAvailableOrders,
//     generateMatrix: generateMatrix,
//     getBoxInfo: getBoxInfo
// };