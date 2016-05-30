/**
 * Created by Szane on 2016/5/28.
 */

var grade = require('../dao/Grade.js');
var km = require('../dao/KmArithmetic.js');
var Seq = require('seq');

function getIoMatchResult(req, res, next) {
    var orders = {};
    Seq().seq(function () {
        var that = this;
        grade.getAvailableOrders(function (result) {
            orders = result;
            that();
        });
    }).seq(function () {
        Seq().seq(function () {
            var that = this;
            grade.generateMatrix(orders.iOrders, orders.eOrders, function (matrix) {
                km.weight = matrix;
                that();
            });
        }).seq(function () {
            km.nx = km.weight.length;
            if (km.nx > 0) {
                km.ny = km.weight[0].length;
                var match = km.match;
                var cost = km.bestmatch();
                console.log("max cost " + cost + "\n");
                for (var i = 0; i < ny; i++) {
                    if (match[i] > -1) {
                        console.log("X" + match[i] + ",Y" + i);
                    }
                }
            }
            return next();
        })
    });
}
module.exports = {
    getIoMatchResult: getIoMatchResult
};