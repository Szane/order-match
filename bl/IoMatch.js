/**
 * Created by Szane on 2016/5/28.
 */

var grade = require('../dao/Grade.js');
var km = require('../dao/KmArithmetic.js');
var Seq = require('seq');
var fs = require('fs');

function getIoMatchResult(req, res, next) {
    var orders = {};
    var weight = [];
    var iOrders = [];
    var eOrders = [];
    Seq().seq(function () {
        var that = this;
        grade.getAvailableOrders(function (result) {
            orders = result;
            iOrders = orders.iOrders;
            eOrders = orders.eOrders;
            that();
        });
    }).seq(function () {
        Seq().seq(function () {
            var that = this;
            grade.generateMatrix(iOrders, eOrders, function (matrix) {
                weight = matrix;
                that();
            });
        }).seq(function () {
            var nx = weight.length;
            if (nx > 0) {
                var ny = weight[0].length;
                var sum = km.bestmatch(nx, ny, weight);
                console.log("max cost " + sum + "\n");
                var map = [];
                if (iOrders.length > eOrders.length) {
                    for (var i = 0; i < ny; i++) {
                        if (km.match[i] > -1) {
                            console.log(iOrders[i].id + "," + eOrders[km.match[i]].id + "," + weight[km.match[i]][i]);
                            map.push([iOrders[i], eOrders[km.match[i]], weight[km.match[i]][i]]);
                        }
                    }
                } else {
                    for (i = 0; i < ny; i++) {
                        if (km.match[i] > -1) {
                            console.log(iOrders[km.match[i]].id + "," + eOrders[i].id + "," + weight[km.match[i]][i]);
                            map.push([iOrders[km.match[i]], eOrders[i], weight[km.match[i]][i]]);
                        }
                    }
                }
                var result = {
                    sum: sum,
                    map: map
                };
                var data = "进口单编号,起始地,目的地,起始时间,到达时间,出口单编号,起始地,目的地,起始时间,到达时间,匹配指数\n";
                fs.writeFile("d:\\match_result.csv", data, function (err) {
                    if (err)
                        console.log("fail " + err);
                    else
                        console.log("write done");
                });
                map.forEach(function (line) {
                    data = "";
                    data += line[0].id + "," + line[0].s_zipcode + "," + line[0].e_zipcode + "," + line[0].s_datetime + "," + line[0].e_datetime + ",";
                    data += line[1].id + "," + line[1].s_zipcode + "," + line[1].e_zipcode + "," + line[1].s_datetime + "," + line[1].e_datetime + ",";
                    data += line[2] + "\n";
                    fs.appendFile("d:\\match_result.csv", data, function (err) {
                        if (err)
                            console.log("fail " + err);
                        else
                            console.log("write done");
                    });
                });
                res.send(result);
                return next();

            }
        });
    });
}
module.exports = {
    getIoMatchResult: getIoMatchResult
};