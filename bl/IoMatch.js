/**
 * Created by Szane on 2016/5/28.
 */

var grade = require('../dao/Grade.js');
var km = require('../dao/KmArithmetic.js');
var Seq = require('seq');

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
                for (var i = 0; i < ny; i++) {
                    if (km.match[i] > -1) {
                        console.log(iOrders[km.match[i]].id + "," + eOrders[i].id);
                        map.push([iOrders[km.match[i]].id, eOrders[i].id, weight[km.match[i]][i]]);
                    }
                }
                var result = {
                    sum: sum,
                    map: map
                }
            }
            res.send(result);
            return next();
        })
    });
}
module.exports = {
    getIoMatchResult: getIoMatchResult
};